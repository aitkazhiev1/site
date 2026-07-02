import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarberForm } from "@/components/features/admin/BarberForm";
import { BarberDeleteButton } from "@/components/features/admin/BarberDeleteButton";

export default async function AdminBarbersPage() {
  const supabase = await createClient();

  const [{ data: barbers, error }, { data: services }] = await Promise.all([
    supabase.from("barbers").select("*, barber_services(service_id)").order("name"),
    supabase.from("services").select("id, name").order("name"),
  ]);

  const serviceOptions = services ?? [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Добавить барбера</CardTitle>
        </CardHeader>
        <CardContent>
          <BarberForm services={serviceOptions} />
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error.message}</p>
      )}

      <div className="space-y-4">
        {(barbers ?? []).map((barber) => (
          <Card key={barber.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {barber.name} {!barber.active && <span className="text-zinc-400">(скрыт)</span>}
              </CardTitle>
              <BarberDeleteButton barberId={barber.id} />
            </CardHeader>
            <CardContent>
              <BarberForm
                services={serviceOptions}
                initial={{
                  id: barber.id,
                  name: barber.name,
                  bio: barber.bio,
                  avatar_url: barber.avatar_url,
                  specialties: barber.specialties,
                  active: barber.active,
                  service_ids: barber.barber_services.map((bs) => bs.service_id),
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
