"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  onDelete,
  confirmText = "Удалить?",
}: {
  onDelete: () => Promise<{ error?: string }>;
  confirmText?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const result = await onDelete();
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Удалено");
        router.refresh();
      }
    });
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={pending}
        className="border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        {pending ? "…" : "Удалить"}
      </Button>
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  );
}
