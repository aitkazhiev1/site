"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Barber, Service } from "@/types";
import { createAppointment } from "@/lib/actions/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarberWithServices extends Barber {
  services: Service[];
}

interface Slot {
  slot_start: string;
  slot_end: string;
}

type Step = "barber" | "service" | "date" | "slot" | "confirm";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingFlow({ barbers }: { barbers: BarberWithServices[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("barber");
  const [barber, setBarber] = useState<BarberWithServices | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string>(todayString());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSlots(barberId: string, serviceId: string, d: string) {
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(`/api/slots?barber_id=${barberId}&service_id=${serviceId}&date=${d}`);
      const json = (await res.json()) as { slots?: Slot[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Ошибка загрузки слотов");
        setSlots([]);
      } else {
        setSlots(json.slots ?? []);
      }
    } catch {
      setError("Не удалось загрузить доступное время");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleConfirm() {
    if (!barber || !service || !slot) return;
    setSubmitting(true);
    setError(null);
    const result = await createAppointment({
      barber_id: barber.id,
      service_id: service.id,
      start_at: slot.slot_start,
      end_at: slot.slot_end,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/my-appointments");
    }
  }

  const steps: Step[] = ["barber", "service", "date", "slot", "confirm"];
  const stepLabels = ["Мастер", "Услуга", "Дата", "Время", "Подтверждение"];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < currentIndex
                  ? "bg-zinc-900 text-white"
                  : i === currentIndex
                    ? "bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2"
                    : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i === currentIndex ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              {stepLabels[i]}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 ${i < currentIndex ? "bg-zinc-900" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {/* Step: Barber */}
      {step === "barber" && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">Выберите мастера</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {barbers.map((b) => (
              <Card
                key={b.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => {
                  setBarber(b);
                  setService(null);
                  setStep("service");
                }}
              >
                <CardHeader>
                  <CardTitle className="text-base">{b.name}</CardTitle>
                  {b.specialties.length > 0 && (
                    <p className="text-sm text-zinc-500">{b.specialties.join(", ")}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step: Service */}
      {step === "service" && barber && (
        <div>
          <button
            onClick={() => setStep("barber")}
            className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            ← Назад
          </button>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">Выберите услугу</h2>
          <p className="mb-4 text-sm text-zinc-500">Мастер: {barber.name}</p>
          {barber.services.length === 0 ? (
            <p className="text-zinc-400">У этого мастера нет услуг.</p>
          ) : (
            <div className="grid gap-4">
              {barber.services.map((s) => (
                <Card
                  key={s.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => {
                    setService(s);
                    setStep("date");
                  }}
                >
                  <CardContent className="flex items-center justify-between pt-6">
                    <div>
                      <p className="font-medium text-zinc-900">{s.name}</p>
                      {s.description && (
                        <p className="mt-0.5 text-sm text-zinc-500">{s.description}</p>
                      )}
                      <p className="mt-1 text-sm text-zinc-400">{s.duration_min} мин</p>
                    </div>
                    <span className="font-semibold text-zinc-900">
                      {s.price.toLocaleString("ru-RU")} ₸
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Date */}
      {step === "date" && barber && service && (
        <div>
          <button
            onClick={() => setStep("service")}
            className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            ← Назад
          </button>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">Выберите дату</h2>
          <p className="mb-4 text-sm text-zinc-500">
            {barber.name} · {service.name}
          </p>
          <input
            type="date"
            value={date}
            min={todayString()}
            onChange={(e) => setDate(e.target.value)}
            className="mb-6 flex h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
          />
          <Button
            onClick={async () => {
              await loadSlots(barber.id, service.id, date);
              setSlot(null);
              setStep("slot");
            }}
          >
            Показать доступное время
          </Button>
        </div>
      )}

      {/* Step: Slot */}
      {step === "slot" && barber && service && (
        <div>
          <button
            onClick={() => setStep("date")}
            className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            ← Назад
          </button>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">Выберите время</h2>
          <p className="mb-4 text-sm text-zinc-500">
            {barber.name} · {service.name} · {date}
          </p>
          {loadingSlots ? (
            <p className="text-zinc-400">Загружаем свободное время…</p>
          ) : slots.length === 0 ? (
            <p className="text-zinc-400">
              На эту дату нет свободного времени. Выберите другую дату.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.slot_start}
                  onClick={() => {
                    setSlot(s);
                    setStep("confirm");
                  }}
                  className="rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                >
                  {formatTime(s.slot_start)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && barber && service && slot && (
        <div>
          <button
            onClick={() => setStep("slot")}
            className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            ← Назад
          </button>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">Подтвердите запись</h2>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Мастер</dt>
                  <dd className="font-medium text-zinc-900">{barber.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Услуга</dt>
                  <dd className="font-medium text-zinc-900">{service.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Дата</dt>
                  <dd className="font-medium text-zinc-900">{formatDate(slot.slot_start)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Время</dt>
                  <dd className="font-medium text-zinc-900">
                    {formatTime(slot.slot_start)} – {formatTime(slot.slot_end)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-3">
                  <dt className="text-zinc-500">Стоимость</dt>
                  <dd className="font-semibold text-zinc-900">
                    {service.price.toLocaleString("ru-RU")} ₸
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Button className="w-full" size="lg" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Записываемся…" : "Подтвердить запись"}
          </Button>
        </div>
      )}
    </div>
  );
}
