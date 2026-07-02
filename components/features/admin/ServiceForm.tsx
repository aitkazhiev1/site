"use client";

import { useActionState } from "react";
import { upsertService } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceFormValues {
  id?: string;
  name?: string;
  description?: string | null;
  duration_min?: number;
  price?: number;
  active?: boolean;
}

export function ServiceForm({ initial }: { initial?: ServiceFormValues }) {
  const [state, action, pending] = useActionState(upsertService, null);
  const key = initial?.id ?? "new";

  return (
    <form action={action} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-1.5">
        <Label htmlFor={`name-${key}`}>Название</Label>
        <Input id={`name-${key}`} name="name" defaultValue={initial?.name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`description-${key}`}>Описание</Label>
        <Textarea
          id={`description-${key}`}
          name="description"
          defaultValue={initial?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`duration-${key}`}>Длительность (мин)</Label>
          <Input
            id={`duration-${key}`}
            name="duration_min"
            type="number"
            min={1}
            defaultValue={initial?.duration_min}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`price-${key}`}>Цена</Label>
          <Input
            id={`price-${key}`}
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial?.price}
            required
          />
        </div>
      </div>

      <label className="text-foreground flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="border-border accent-accent rounded"
        />
        Активна (видна на витрине)
      </label>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : initial?.id ? "Сохранить" : "Добавить услугу"}
      </Button>
    </form>
  );
}
