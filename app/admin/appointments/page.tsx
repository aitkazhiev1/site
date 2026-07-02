import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusSelect } from "@/components/features/admin/StatusSelect";
import type { AppointmentStatus } from "@/types";

export const metadata: Metadata = { title: "Записи" };

const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
};

interface Filters {
  date?: string;
  barber_id?: string;
  status?: string;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();

  const { data: barbers } = await supabase.from("barbers").select("id, name").order("name");

  let query = supabase
    .from("appointments")
    .select(
      "id, start_at, end_at, status, notes, barbers(name), services(name, duration_min, price), profiles(full_name, phone)",
    )
    .order("start_at", { ascending: false });

  if (filters.date) {
    query = query
      .gte("start_at", `${filters.date}T00:00:00`)
      .lt("start_at", `${filters.date}T23:59:59.999`);
  }
  if (filters.barber_id) query = query.eq("barber_id", filters.barber_id);
  if (filters.status) {
    query = query.eq("status", filters.status as AppointmentStatus);
  }

  const { data: appointments, error } = await query;

  return (
    <div>
      <form className="border-border bg-card mb-6 flex flex-wrap items-end gap-3 rounded-2xl border p-4">
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs font-medium" htmlFor="date">
            Дата
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={filters.date ?? ""}
            className="border-border bg-surface text-foreground focus:border-accent/50 focus:ring-ring focus:ring-offset-background flex h-10 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-1 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs font-medium" htmlFor="barber_id">
            Барбер
          </label>
          <Select id="barber_id" name="barber_id" defaultValue={filters.barber_id ?? ""}>
            <option value="">Все</option>
            {(barbers ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs font-medium" htmlFor="status">
            Статус
          </label>
          <Select id="status" name="status" defaultValue={filters.status ?? ""}>
            <option value="">Все</option>
            {Object.entries(statusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" size="default">
          Применить
        </Button>
      </form>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
          {error.message}
        </p>
      )}

      {!error && (appointments ?? []).length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-16 text-center">
            Записей не найдено.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(appointments ?? []).map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div className="space-y-1">
                  <p className="text-foreground font-medium">
                    {a.barbers?.name ?? "—"} · {a.services?.name ?? "—"}
                  </p>
                  <p className="text-muted-foreground text-sm">{formatDateTime(a.start_at)}</p>
                  <p className="text-muted-foreground text-sm">
                    {a.profiles?.full_name ?? "Без имени"}
                    {a.profiles?.phone ? ` · ${a.profiles.phone}` : ""}
                  </p>
                  {a.notes && <p className="text-muted-foreground text-sm">Заметка: {a.notes}</p>}
                </div>
                <StatusSelect appointmentId={a.id} status={a.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
