"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/lib/actions/admin";
import { Select } from "@/components/ui/select";
import type { AppointmentStatus } from "@/types";

const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
};

export function StatusSelect({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as AppointmentStatus;
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, next);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Статус обновлён");
        router.refresh();
      }
    });
  }

  return (
    <div className="w-40">
      <Select value={status} onChange={handleChange} disabled={pending}>
        {Object.entries(statusLabel).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  );
}
