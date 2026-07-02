"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import type { AppointmentStatus } from "@/types";

type ActionResult = { error?: string };

async function requireAdmin(): Promise<{ error: string } | { error?: undefined }> {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) return { error: "Необходимо войти в аккаунт" };
  if (profile?.role !== "admin") return { error: "Недостаточно прав" };
  return {};
}

const appointmentStatusSchema = z.object({
  id: z.uuid({ error: "Некорректный id записи" }),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"], {
    error: "Некорректный статус",
  }),
});

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = appointmentStatusSchema.safeParse({ id, status });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidatePath("/admin/appointments");
  return {};
}

const barberSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, { error: "Минимум 2 символа" }),
  bio: z.string().trim().optional(),
  avatar_url: z.union([z.url({ error: "Некорректный URL" }), z.literal("")]).optional(),
  specialties: z.string().trim().optional(),
  active: z.boolean(),
  service_ids: z.array(z.uuid()).optional(),
});

export async function upsertBarber(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = barberSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    avatar_url: formData.get("avatar_url") || "",
    specialties: formData.get("specialties") || undefined,
    active: formData.get("active") === "on",
    service_ids: formData.getAll("service_ids").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };

  const { id, name, bio, avatar_url, specialties, active, service_ids } = parsed.data;
  const specialtiesArray = specialties
    ? specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const supabase = await createClient();
  const { data: barber, error } = await supabase
    .from("barbers")
    .upsert({
      ...(id ? { id } : {}),
      name,
      bio: bio || null,
      avatar_url: avatar_url || null,
      specialties: specialtiesArray,
      active,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const { error: unlinkError } = await supabase
    .from("barber_services")
    .delete()
    .eq("barber_id", barber.id);
  if (unlinkError) return { error: unlinkError.message };

  if (service_ids && service_ids.length > 0) {
    const { error: linkError } = await supabase
      .from("barber_services")
      .insert(service_ids.map((service_id) => ({ barber_id: barber.id, service_id })));
    if (linkError) return { error: linkError.message };
  }

  revalidatePath("/admin/barbers");
  revalidatePath("/");
  return {};
}

export async function deleteBarber(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { error: "Некорректный id" };

  const supabase = await createClient();
  const { error } = await supabase.from("barbers").delete().eq("id", parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/barbers");
  revalidatePath("/");
  return {};
}

const serviceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, { error: "Минимум 2 символа" }),
  description: z.string().trim().optional(),
  duration_min: z.coerce.number().int().positive({ error: "Длительность должна быть больше 0" }),
  price: z.coerce.number().nonnegative({ error: "Цена не может быть отрицательной" }),
  active: z.boolean(),
});

export async function upsertService(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = serviceSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    duration_min: formData.get("duration_min"),
    price: formData.get("price"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };

  const { id, name, description, duration_min, price, active } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("services").upsert({
    ...(id ? { id } : {}),
    name,
    description: description || null,
    duration_min,
    price,
    active,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/services");
  revalidatePath("/");
  return {};
}

export async function deleteService(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { error: "Некорректный id" };

  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/services");
  revalidatePath("/");
  return {};
}

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const workingHoursSchema = z.object({
  barber_id: z.uuid({ error: "Выберите барбера" }),
  weekday: z.coerce.number().int().min(0).max(6),
  start_time: z.string().regex(timeRegex, { error: "Формат ЧЧ:ММ" }),
  end_time: z.string().regex(timeRegex, { error: "Формат ЧЧ:ММ" }),
});

export async function addWorkingHours(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = workingHoursSchema.safeParse({
    barber_id: formData.get("barber_id"),
    weekday: formData.get("weekday"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };
  if (parsed.data.start_time >= parsed.data.end_time) {
    return { error: "Время начала должно быть раньше времени окончания" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("working_hours").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  return {};
}

export async function deleteWorkingHours(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { error: "Некорректный id" };

  const supabase = await createClient();
  const { error } = await supabase.from("working_hours").delete().eq("id", parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  return {};
}

const timeOffSchema = z
  .object({
    barber_id: z.uuid({ error: "Выберите барбера" }),
    start_at: z.iso.datetime({ error: "Некорректная дата начала", local: true }),
    end_at: z.iso.datetime({ error: "Некорректная дата окончания", local: true }),
    reason: z.string().trim().optional(),
  })
  .refine((v) => v.start_at < v.end_at, {
    error: "Начало должно быть раньше окончания",
    path: ["end_at"],
  });

export async function addTimeOff(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = timeOffSchema.safeParse({
    barber_id: formData.get("barber_id"),
    start_at: formData.get("start_at"),
    end_at: formData.get("end_at"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };

  const supabase = await createClient();
  const { error } = await supabase.from("time_off").insert({
    barber_id: parsed.data.barber_id,
    start_at: parsed.data.start_at,
    end_at: parsed.data.end_at,
    reason: parsed.data.reason || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  return {};
}

export async function deleteTimeOff(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { error: "Некорректный id" };

  const supabase = await createClient();
  const { error } = await supabase.from("time_off").delete().eq("id", parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  return {};
}
