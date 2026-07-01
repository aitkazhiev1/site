"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointment } from "@/lib/actions/booking";
import { Button } from "@/components/ui/button";

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("Отменить запись?")) return;
    setLoading(true);
    setError(null);
    const result = await cancelAppointment(appointmentId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancel}
        disabled={loading}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {loading ? "Отменяем…" : "Отменить"}
      </Button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
