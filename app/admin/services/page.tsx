import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceForm } from "@/components/features/admin/ServiceForm";
import { ServiceDeleteButton } from "@/components/features/admin/ServiceDeleteButton";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services, error } = await supabase.from("services").select("*").order("name");

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Добавить услугу</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error.message}</p>
      )}

      <div className="space-y-4">
        {(services ?? []).map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {service.name} {!service.active && <span className="text-zinc-400">(скрыта)</span>}
              </CardTitle>
              <ServiceDeleteButton serviceId={service.id} />
            </CardHeader>
            <CardContent>
              <ServiceForm initial={service} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
