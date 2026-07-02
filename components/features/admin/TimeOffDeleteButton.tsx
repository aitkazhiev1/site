"use client";

import { deleteTimeOff } from "@/lib/actions/admin";
import { DeleteButton } from "@/components/features/admin/DeleteButton";

export function TimeOffDeleteButton({ timeOffId }: { timeOffId: string }) {
  return (
    <DeleteButton onDelete={() => deleteTimeOff(timeOffId)} confirmText="Удалить блокировку?" />
  );
}
