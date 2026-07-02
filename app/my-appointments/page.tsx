import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/features/appointments/CancelButton";
import type { AppointmentStatus } from "@/types";

interface AppointmentRow {
  id: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  notes: string | null;
  barbers: { name: string } | null;
  services: { name: string; price: number; duration_min: number } | null;
}

const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
};

const statusColor: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-zinc-100 text-zinc-400",
  completed: "bg-blue-50 text-blue-700",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

  const upcoming = appointments.filter(
    (a) =>
      a.status !== "cancelled" && a.status !== "completed" && new Date(a.start_at) > new Date(),
  );
  const past = appointments.filter(
    (a) =>
      a.status === "completed" || a.status === "cancelled" || new Date(a.start_at) <= new Date(),
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Мои записи</h1>
        <Link href="/book">
          <Button size="sm">Новая запись</Button>
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-white py-16 text-center">
          <p className="text-zinc-400">У вас пока нет записей.</p>
          <Link href="/book" className="mt-4 inline-block">
            <Button>Записаться</Button>
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-zinc-700">Предстоящие</h2>
              <div className="space-y-4">
                {upcoming.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} canCancel />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-zinc-700">История</h2>
              <div className="space-y-4">
                {past.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} canCancel={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function AppointmentCard({
  appointment: a,
  canCancel,
}: {
  appointment: AppointmentRow;
  canCancel: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-zinc-900">
              {a.barbers?.name ?? "—"} · {a.services?.name ?? "—"}
            </p>
            <p className="text-sm text-zinc-500">{formatDateTime(a.start_at)}</p>
            {a.services && (
              <p className="text-sm text-zinc-400">
                {a.services.duration_min} мин · {a.services.price.toLocaleString("ru-RU")} ₸
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[a.status]}`}
            >
              {statusLabel[a.status]}
            </span>
            {canCancel && <CancelButton appointmentId={a.id} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
