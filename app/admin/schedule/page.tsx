import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WorkingHoursForm } from "@/components/features/admin/WorkingHoursForm";
import { WorkingHoursDeleteButton } from "@/components/features/admin/WorkingHoursDeleteButton";
import { TimeOffForm } from "@/components/features/admin/TimeOffForm";
import { TimeOffDeleteButton } from "@/components/features/admin/TimeOffDeleteButton";

const weekdayLabel: Record<number, string> = {
  0: "Вс",
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ barber_id?: string }>;
}) {
  const { barber_id } = await searchParams;
  const supabase = await createClient();

  const { data: barbers } = await supabase.from("barbers").select("id, name").order("name");
  const selectedBarberId = barber_id ?? barbers?.[0]?.id;

  if (!selectedBarberId) {
    return <p className="text-zinc-400">Сначала добавьте барбера.</p>;
  }

  const [{ data: workingHours }, { data: timeOff }] = await Promise.all([
    supabase
      .from("working_hours")
      .select("*")
      .eq("barber_id", selectedBarberId)
      .order("weekday")
      .order("start_time"),
    supabase
      .from("time_off")
      .select("*")
      .eq("barber_id", selectedBarberId)
      .order("start_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-8">
      <form className="flex items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500" htmlFor="barber_id">
            Барбер
          </label>
          <Select id="barber_id" name="barber_id" defaultValue={selectedBarberId}>
            {(barbers ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Показать</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Рабочие часы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WorkingHoursForm barberId={selectedBarberId} />
          <div className="space-y-2">
            {(workingHours ?? []).length === 0 ? (
              <p className="text-sm text-zinc-400">Расписание не задано.</p>
            ) : (
              (workingHours ?? []).map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-2 text-sm"
                >
                  <span>
                    {weekdayLabel[wh.weekday]}: {wh.start_time.slice(0, 5)}–
                    {wh.end_time.slice(0, 5)}
                  </span>
                  <WorkingHoursDeleteButton workingHoursId={wh.id} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Блокировки времени (отпуск, больничный)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeOffForm barberId={selectedBarberId} />
          <div className="space-y-2">
            {(timeOff ?? []).length === 0 ? (
              <p className="text-sm text-zinc-400">Блокировок нет.</p>
            ) : (
              (timeOff ?? []).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-2 text-sm"
                >
                  <span>
                    {formatDateTime(t.start_at)} – {formatDateTime(t.end_at)}
                    {t.reason ? ` · ${t.reason}` : ""}
                  </span>
                  <TimeOffDeleteButton timeOffId={t.id} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
