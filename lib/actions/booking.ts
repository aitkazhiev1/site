"use server";

import { createClient } from "@/lib/supabase/server";

interface CreateAppointmentInput {
  barber_id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  notes?: string;
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Необходимо войти в аккаунт" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("appointments").insert({
      barber_id: input.barber_id,
      service_id: input.service_id,
      customer_id: user.id,
      start_at: input.start_at,
      end_at: input.end_at,
      notes: input.notes ?? null,
      status: "pending",
    });

    if (error) return { error: error.message };
    return {};
  } catch {
    return { error: "Не удалось создать запись" };
  }
}

export async function cancelAppointment(appointmentId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Необходимо войти в аккаунт" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId)
      .eq("customer_id", user.id);

    if (error) return { error: error.message };
    return {};
  } catch {
    return { error: "Не удалось отменить запись" };
  }
}
