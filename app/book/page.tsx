import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/features/booking/BookingFlow";
import type { Barber, Service } from "@/types";

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
      <div className="border-b border-zinc-100 bg-white px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-zinc-900">Онлайн запись</h1>
          <p className="mt-2 text-zinc-500">Выберите мастера, услугу и удобное время</p>
        </div>
      </div>
      {barbers.length === 0 ? (
        <div className="mx-auto max-w-2xl px-6 py-12 text-center">
          <p className="text-zinc-400">
            Подключите Supabase и добавьте мастеров, чтобы начать принимать записи.
          </p>
        </div>
      ) : (
        <BookingFlow barbers={barbers} />
      )}
    </div>
  );
}
