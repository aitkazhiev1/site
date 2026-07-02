"use client";

import { useActionState, useState } from "react";
import { addTimeOff } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// A datetime-local input yields a naive wall-clock string ("2026-07-15T14:00")
// with no timezone. Converting it through `new Date(local).toISOString()` in the
// browser interprets it in the admin's local timezone and emits an absolute UTC
// instant, which is what the server action + timestamptz column expect. Without
// this the value would be reinterpreted in the DB's timezone and the blocked
// range could land hours away from what the admin picked.
function localToIso(local: string): string {
  if (!local) return "";
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function TimeOffForm({ barberId }: { barberId: string }) {
  const [state, action, pending] = useActionState(addTimeOff, null);
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="barber_id" value={barberId} />
      <input type="hidden" name="start_at" value={localToIso(startLocal)} />
      <input type="hidden" name="end_at" value={localToIso(endLocal)} />
      <div className="space-y-1">
        <Label htmlFor="start_at_local">С</Label>
        <Input
          id="start_at_local"
          type="datetime-local"
          required
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="end_at_local">До</Label>
        <Input
          id="end_at_local"
          type="datetime-local"
          required
          value={endLocal}
          onChange={(e) => setEndLocal(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="reason">Причина</Label>
        <Input id="reason" name="reason" placeholder="Отпуск, больничный…" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Заблокировать"}
      </Button>
      {state?.error && <p className="text-destructive w-full text-sm">{state.error}</p>}
    </form>
  );
}
