"use client";

import { deleteWorkingHours } from "@/lib/actions/admin";
import { DeleteButton } from "@/components/features/admin/DeleteButton";

export function WorkingHoursDeleteButton({ workingHoursId }: { workingHoursId: string }) {
  return (
    <DeleteButton
      onDelete={() => deleteWorkingHours(workingHoursId)}
      confirmText="Удалить интервал расписания?"
    />
  );
}
