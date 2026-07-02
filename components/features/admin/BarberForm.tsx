"use client";

import { useActionState } from "react";
import { upsertBarber } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BarberFormValues {
  id?: string;
  name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  specialties?: string[];
  active?: boolean;
  service_ids?: string[];
}

export function BarberForm({
  services,
  initial,
}: {
  services: { id: string; name: string }[];
  initial?: BarberFormValues;
}) {
  const [state, action, pending] = useActionState(upsertBarber, null);

  const selectedServiceIds = new Set(initial?.service_ids ?? []);

  return (
    <form action={action} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-1.5">
        <Label htmlFor={`name-${initial?.id ?? "new"}`}>Имя</Label>
        <Input
          id={`name-${initial?.id ?? "new"}`}
          name="name"
          defaultValue={initial?.name}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`bio-${initial?.id ?? "new"}`}>Био</Label>
        <Textarea id={`bio-${initial?.id ?? "new"}`} name="bio" defaultValue={initial?.bio ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`avatar-${initial?.id ?? "new"}`}>URL аватара</Label>
        <Input
          id={`avatar-${initial?.id ?? "new"}`}
          name="avatar_url"
          defaultValue={initial?.avatar_url ?? ""}
          placeholder="https://…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`specialties-${initial?.id ?? "new"}`}>Специализации (через запятую)</Label>
        <Input
          id={`specialties-${initial?.id ?? "new"}`}
          name="specialties"
          defaultValue={(initial?.specialties ?? []).join(", ")}
        />
      </div>

      {services.length > 0 && (
        <div className="space-y-1.5">
          <Label>Услуги</Label>
          <div className="border-border grid grid-cols-2 gap-2 rounded-lg border p-3">
            {services.map((s) => (
              <label key={s.id} className="text-foreground flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="service_ids"
                  value={s.id}
                  defaultChecked={selectedServiceIds.has(s.id)}
                  className="border-border accent-accent rounded"
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="text-foreground flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="border-border accent-accent rounded"
        />
        Активен (виден на витрине)
      </label>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : initial?.id ? "Сохранить" : "Добавить барбера"}
      </Button>
    </form>
  );
}
