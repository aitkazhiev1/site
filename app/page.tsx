import Link from "next/link";
import Image from "next/image";
import { Scissors } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Barber, Service } from "@/types";

async function getBarbers(): Promise<Barber[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("barbers").select("*").eq("active", true).order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

async function getServices(): Promise<Service[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("services").select("*").eq("active", true).order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [barbers, services, user] = await Promise.all([getBarbers(), getServices(), getUser()]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-28 sm:py-36">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent)",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-accent mb-4 text-sm font-medium tracking-[0.2em] uppercase">
            Барбершоп премиум-класса
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Стрижка, которую вы заслуживаете
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
            Запишитесь онлайн к лучшим мастерам. Без очередей, в удобное время.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={user ? "/book" : "/register"}>
              <Button size="lg" className="w-full sm:w-auto">
                Записаться
              </Button>
            </Link>
            <Link href="#barbers">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Наши мастера
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section id="barbers" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display mb-10 text-3xl font-semibold">Наши мастера</h2>
        {barbers.length === 0 ? (
          <EmptyState message="Мастера появятся здесь после подключения Supabase." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((barber) => (
              <Card key={barber.id} className="overflow-hidden">
                {barber.avatar_url ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={barber.avatar_url}
                      alt={barber.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-muted flex h-48 items-center justify-center">
                    <span className="font-display text-accent/70 text-5xl font-semibold">
                      {barber.name[0]}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{barber.name}</CardTitle>
                  {barber.specialties.length > 0 && (
                    <CardDescription>{barber.specialties.join(", ")}</CardDescription>
                  )}
                </CardHeader>
                {barber.bio && (
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{barber.bio}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="border-border/60 border-t px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display mb-10 text-3xl font-semibold">Услуги</h2>
          {services.length === 0 ? (
            <EmptyState message="Услуги появятся здесь после подключения Supabase." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    {service.description && (
                      <CardDescription>{service.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {service.duration_min} мин
                      </span>
                      <span className="font-display text-accent font-semibold">
                        {service.price.toLocaleString("ru-RU")} ₸
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-12 text-center">
            <Link href="/book">
              <Button size="lg">Записаться онлайн</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
      <Scissors className="text-muted-foreground h-8 w-8" aria-hidden />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
