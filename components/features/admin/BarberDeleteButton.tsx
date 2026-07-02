"use client";

import { deleteBarber } from "@/lib/actions/admin";
import { DeleteButton } from "@/components/features/admin/DeleteButton";

export function BarberDeleteButton({ barberId }: { barberId: string }) {
  return (
    <DeleteButton
      onDelete={() => deleteBarber(barberId)}
      confirmText="Удалить барбера вместе с расписанием и услугами?"
    />
  );
}
