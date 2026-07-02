import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const barberId = searchParams.get("barber_id");
  const serviceId = searchParams.get("service_id");
  const date = searchParams.get("date");

  if (!barberId || !serviceId || !date) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("get_available_slots", {
      p_barber_id: barberId,
      p_service_id: serviceId,
      p_date: date,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ slots: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
