"use client";

import { useActionState } from "react";
import { addTimeOff } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TimeOffForm({ barberId }: { barberId: string }) {
  const [state, action, pending] = useActionState(addTimeOff, null);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="barber_id" value={barberId} />
      <div className="space-y-1">
        <Label htmlFor="start_at">С</Label>
        <Input id="start_at" name="start_at" type="datetime-local" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="end_at">До</Label>
        <Input id="end_at" name="end_at" type="datetime-local" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="reason">Причина</Label>
        <Input id="reason" name="reason" placeholder="Отпуск, больничный…" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Заблокировать"}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
