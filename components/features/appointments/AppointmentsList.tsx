"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { cancelAppointment } from "@/lib/actions/booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus } from "@/types";

export interface AppointmentRow {
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

const statusClass: Record<AppointmentStatus, string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
  completed: "bg-accent/15 text-accent",
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

export function AppointmentsList({ appointments }: { appointments: AppointmentRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticAppointments, markCancelled] = useOptimistic(
    appointments,
    (state, cancelledId: string) =>
      state.map((a) => (a.id === cancelledId ? { ...a, status: "cancelled" as const } : a)),
  );

  function handleCancel(id: string) {
    startTransition(async () => {
      markCancelled(id);
      const result = await cancelAppointment(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Запись отменена");
        router.refresh();
      }
    });
  }

  if (optimisticAppointments.length === 0) {
    return (
      <div className="border-border rounded-2xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">У вас пока нет записей.</p>
        <Link href="/book" className="mt-4 inline-block">
          <Button>Записаться</Button>
        </Link>
      </div>
    );
  }

  const upcoming = optimisticAppointments.filter(
    (a) =>
      a.status !== "cancelled" && a.status !== "completed" && new Date(a.start_at) > new Date(),
  );
  const past = optimisticAppointments.filter(
    (a) =>
      a.status === "completed" || a.status === "cancelled" || new Date(a.start_at) <= new Date(),
  );

  return (
    <>
      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Предстоящие</h2>
          <div className="space-y-4">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} appointment={a} canCancel onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="text-foreground mb-4 text-lg font-semibold">История</h2>
          <div className="space-y-4">
            {past.map((a) => (
              <AppointmentCard key={a.id} appointment={a} canCancel={false} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function AppointmentCard({
  appointment: a,
  canCancel,
  onCancel,
}: {
  appointment: AppointmentRow;
  canCancel: boolean;
  onCancel?: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-foreground font-medium">
              {a.barbers?.name ?? "—"} · {a.services?.name ?? "—"}
            </p>
            <p className="text-muted-foreground text-sm">{formatDateTime(a.start_at)}</p>
            {a.services && (
              <p className="text-muted-foreground text-sm">
                {a.services.duration_min} мин · {a.services.price.toLocaleString("ru-RU")} ₸
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[a.status]}`}
            >
              {statusLabel[a.status]}
            </span>
            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Отменить запись?")) onCancel(a.id);
                }}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                Отменить
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
