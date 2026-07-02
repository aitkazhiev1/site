"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

const createAppointmentSchema = z.object({
  barber_id: z.uuid({ error: "Некорректный барбер" }),
  service_id: z.uuid({ error: "Некорректная услуга" }),
  start_at: z.iso.datetime({ error: "Некорректное время начала", offset: true }),
  end_at: z.iso.datetime({ error: "Некорректное время окончания", offset: true }),
  notes: z.string().trim().max(500, { error: "Не более 500 символов" }).optional(),
});

type CreateAppointmentInput = z.input<typeof createAppointmentSchema>;

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Необходимо войти в аккаунт" };

    if (isRateLimited(`booking:${user.id}`, 5, 60_000)) {
      return { error: "Слишком много попыток. Подождите минуту и попробуйте снова." };
    }

    const parsed = createAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };
    }

    const { error } = await supabase.from("appointments").insert({
      barber_id: parsed.data.barber_id,
      service_id: parsed.data.service_id,
      customer_id: user.id,
      start_at: parsed.data.start_at,
      end_at: parsed.data.end_at,
      notes: parsed.data.notes ?? null,
      status: "pending",
    });

    if (error) return { error: error.message };
    return {};
  } catch {
    return { error: "Не удалось создать запись" };
  }
}

const cancelAppointmentSchema = z.uuid({ error: "Некорректный id записи" });

export async function cancelAppointment(appointmentId: string): Promise<{ error?: string }> {
  try {
    const parsed = cancelAppointmentSchema.safeParse(appointmentId);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Необходимо войти в аккаунт" };

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", parsed.data)
      .eq("customer_id", user.id);

    if (error) return { error: error.message };
    return {};
  } catch {
    return { error: "Не удалось отменить запись" };
  }
}
