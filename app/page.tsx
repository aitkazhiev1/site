import Link from "next/link";
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

export default async function HomePage() {
  const [barbers, services] = await Promise.all([getBarbers(), getServices()]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-zinc-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">Стрижка, которую вы заслуживаете</h1>
          <p className="mt-6 text-lg text-zinc-300">
            Запишитесь онлайн к лучшим мастерам. Без очередей, в удобное время.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">
                Записаться
              </Button>
            </Link>
            <Link href="#barbers">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Наши мастера
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section id="barbers" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-3xl font-bold text-zinc-900">Наши мастера</h2>
        {barbers.length === 0 ? (
          <p className="text-zinc-400">Мастера появятся здесь после подключения Supabase.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((barber) => (
              <Card key={barber.id} className="overflow-hidden">
                {barber.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={barber.avatar_url}
                    alt={barber.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-zinc-100">
                    <span className="text-5xl font-bold text-zinc-300">{barber.name[0]}</span>
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
                    <p className="text-sm text-zinc-500">{barber.bio}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-3xl font-bold text-zinc-900">Услуги</h2>
          {services.length === 0 ? (
            <p className="text-zinc-400">Услуги появятся здесь после подключения Supabase.</p>
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
                      <span className="text-sm text-zinc-500">{service.duration_min} мин</span>
                      <span className="font-semibold text-zinc-900">
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
