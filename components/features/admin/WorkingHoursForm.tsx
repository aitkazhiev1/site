"use client";

import { useActionState } from "react";
import { addWorkingHours } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const weekdays = [
  { value: 0, label: "Воскресенье" },
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
];

export function WorkingHoursForm({ barberId }: { barberId: string }) {
  const [state, action, pending] = useActionState(addWorkingHours, null);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="barber_id" value={barberId} />
      <div className="space-y-1">
        <Label htmlFor="weekday">День</Label>
        <Select id="weekday" name="weekday" defaultValue="1">
          {weekdays.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="start_time">С</Label>
        <Input id="start_time" name="start_time" type="time" defaultValue="09:00" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="end_time">До</Label>
        <Input id="end_time" name="end_time" type="time" defaultValue="18:00" required />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Добавить"}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
