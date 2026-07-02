"use client";

import { deleteService } from "@/lib/actions/admin";
import { DeleteButton } from "@/components/features/admin/DeleteButton";

export function ServiceDeleteButton({ serviceId }: { serviceId: string }) {
  return <DeleteButton onDelete={() => deleteService(serviceId)} confirmText="Удалить услугу?" />;
}
