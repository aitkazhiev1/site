import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  AppointmentsList,
  type AppointmentRow,
} from "@/components/features/appointments/AppointmentsList";

export const metadata: Metadata = {
  title: "Мои записи",
  robots: { index: false, follow: false },
};

export default async function MyAppointmentsPage() {
  let user = null;
  let appointments: AppointmentRow[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: rows } = await supabase
        .from("appointments")
        .select(
          `
          id, start_at, end_at, status, notes,
          barbers(name),
          services(name, price, duration_min)
        `,
        )
        .eq("customer_id", user.id)
        .order("start_at", { ascending: false });

      appointments = rows ?? [];
    }
  } catch {
    // Supabase not configured
  }

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Мои записи</h1>
        <Link href="/book">
          <Button size="sm">Новая запись</Button>
        </Link>
      </div>

      <AppointmentsList appointments={appointments} />
    </div>
  );
}
