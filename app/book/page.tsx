import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/features/booking/BookingFlow";
import type { Barber, Service } from "@/types";

export const metadata: Metadata = {
  title: "Онлайн запись",
  description: "Выберите мастера, услугу и удобное время — запись занимает меньше минуты.",
};

interface BarberWithServices extends Barber {
  services: Service[];
}

export default async function BookPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login");
  }

  if (!user) redirect("/login");

  let barbers: BarberWithServices[] = [];
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("barbers")
      .select("*, barber_services(services(*))")
      .eq("active", true)
      .order("name");

    barbers = (data ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      bio: b.bio,
      avatar_url: b.avatar_url,
      specialties: b.specialties,
      active: b.active,
      services: b.barber_services.map((bs) => bs.services).filter((s) => s !== null),
    }));
  } catch {
    // Supabase not configured — show empty state
  }

  return (
    <div>
      <div className="border-border/60 border-b px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold">Онлайн запись</h1>
          <p className="text-muted-foreground mt-2">Выберите мастера, услугу и удобное время</p>
        </div>
      </div>
      {barbers.length === 0 ? (
        <div className="mx-auto max-w-2xl px-6 py-12 text-center">
          <p className="text-muted-foreground">
            Подключите Supabase и добавьте мастеров, чтобы начать принимать записи.
          </p>
        </div>
      ) : (
        <BookingFlow barbers={barbers} />
      )}
    </div>
  );
}
