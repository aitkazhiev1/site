"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import type { Barber, Service } from "@/types";
import { createAppointment } from "@/lib/actions/booking";
import { isSlotAvailable } from "@/lib/slots";
import { formatDate, formatDateOnly, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BarberWithServices extends Barber {
  services: Service[];
}

interface Slot {
  slot_start: string;
  slot_end: string;
}

type Step = "barber" | "service" | "date" | "slot" | "confirm";

const STEP_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

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
      toast.error(result.error);
    } else {
      toast.success("Запись создана");
      router.push("/my-appointments");
    }
  }

  // The server already excludes booked/blocked ranges; this only guards
  // against a slot slipping into the past while the user was browsing.
  const visibleSlots = slots.filter((s) =>
    isSlotAvailable({ start: s.slot_start, end: s.slot_end }, []),
  );

  const steps: Step[] = ["barber", "service", "date", "slot", "confirm"];
  const stepLabels = ["Мастер", "Услуга", "Дата", "Время", "Подтверждение"];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Step indicator */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Шаги записи">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <div
              aria-current={i === currentIndex ? "step" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
                i < currentIndex
                  ? "bg-accent text-accent-foreground"
                  : i === currentIndex
                    ? "bg-accent text-accent-foreground ring-accent/40 ring-offset-background ring-2 ring-offset-2"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i === currentIndex ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {stepLabels[i]}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-6 transition-colors duration-200 ${i < currentIndex ? "bg-accent" : "bg-border"}`}
              />
            )}
          </li>
        ))}
      </ol>

      {error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
        >
          {error}
        </p>
      )}

      <AnimatePresence mode="wait">
        {/* Step: Barber */}
        {step === "barber" && (
          <motion.div
            key="barber"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={STEP_TRANSITION}
          >
            <h2 className="font-display mb-6 text-2xl font-semibold">Выберите мастера</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {barbers.map((b) => (
                <Card
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  className="hover:border-accent/50 focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  onClick={() => {
                    setBarber(b);
                    setService(null);
                    setStep("service");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setBarber(b);
                      setService(null);
                      setStep("service");
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{b.name}</CardTitle>
                    {b.specialties.length > 0 && (
                      <p className="text-muted-foreground text-sm">{b.specialties.join(", ")}</p>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Service */}
        {step === "service" && barber && (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={STEP_TRANSITION}
          >
            <BackButton onClick={() => setStep("barber")} />
            <h2 className="font-display mb-6 text-2xl font-semibold">Выберите услугу</h2>
            <p className="text-muted-foreground mb-4 text-sm">Мастер: {barber.name}</p>
            {barber.services.length === 0 ? (
              <p className="text-muted-foreground">У этого мастера нет услуг.</p>
            ) : (
              <div className="grid gap-4">
                {barber.services.map((s) => (
                  <Card
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    className="hover:border-accent/50 focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    onClick={() => {
                      setService(s);
                      setStep("date");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setService(s);
                        setStep("date");
                      }
                    }}
                  >
                    <CardContent className="flex items-center justify-between pt-6">
                      <div>
                        <p className="text-foreground font-medium">{s.name}</p>
                        {s.description && (
                          <p className="text-muted-foreground mt-0.5 text-sm">{s.description}</p>
                        )}
                        <p className="text-muted-foreground mt-1 text-sm">{s.duration_min} мин</p>
                      </div>
                      <span className="font-display text-accent font-semibold">
                        {s.price.toLocaleString("ru-RU")} ₸
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step: Date */}
        {step === "date" && barber && service && (
          <motion.div
            key="date"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={STEP_TRANSITION}
          >
            <BackButton onClick={() => setStep("service")} />
            <h2 className="font-display mb-6 text-2xl font-semibold">Выберите дату</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              {barber.name} · {service.name}
            </p>
            <input
              type="date"
              value={date}
              min={todayString()}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Дата записи"
              className="border-border bg-surface text-foreground focus:border-accent/50 focus:ring-ring focus:ring-offset-background mb-6 flex h-10 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-1 focus:outline-none"
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
          </motion.div>
        )}

        {/* Step: Slot */}
        {step === "slot" && barber && service && (
          <motion.div
            key="slot"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={STEP_TRANSITION}
          >
            <BackButton onClick={() => setStep("date")} />
            <h2 className="font-display mb-6 text-2xl font-semibold">Выберите время</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              {barber.name} · {service.name} · {formatDateOnly(date)}
            </p>
            {loadingSlots ? (
              <div
                className="grid grid-cols-3 gap-3 sm:grid-cols-4"
                aria-label="Загружаем свободное время"
                aria-busy="true"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-9" />
                ))}
              </div>
            ) : visibleSlots.length === 0 ? (
              <p className="text-muted-foreground">
                На эту дату нет свободного времени. Выберите другую дату.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {visibleSlots.map((s) => (
                  <button
                    key={s.slot_start}
                    onClick={() => {
                      setSlot(s);
                      setStep("confirm");
                    }}
                    className="border-border bg-surface text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-lg border py-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {formatTime(s.slot_start)}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && barber && service && slot && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={STEP_TRANSITION}
          >
            <BackButton onClick={() => setStep("slot")} />
            <h2 className="font-display mb-6 text-2xl font-semibold">Подтвердите запись</h2>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Мастер</dt>
                    <dd className="text-foreground font-medium">{barber.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Услуга</dt>
                    <dd className="text-foreground font-medium">{service.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Дата</dt>
                    <dd className="text-foreground font-medium">{formatDate(slot.slot_start)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Время</dt>
                    <dd className="text-foreground font-medium">
                      {formatTime(slot.slot_start)} – {formatTime(slot.slot_end)}
                    </dd>
                  </div>
                  <div className="border-border flex justify-between border-t pt-3">
                    <dt className="text-muted-foreground">Стоимость</dt>
                    <dd className="font-display text-accent font-semibold">
                      {service.price.toLocaleString("ru-RU")} ₸
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Записываемся…" : "Подтвердить запись"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 text-sm transition-colors duration-200"
    >
      ← Назад
    </button>
  );
}
