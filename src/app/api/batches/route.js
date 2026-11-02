import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("batches")
      .select("id, name, start_date, schedule_text, price_inr, seat_limit, seats_taken")
      .eq("is_open", true)
      .order("start_date", { ascending: true });

    if (error) {
      return NextResponse.json({ batches: [] });
    }

    const batches = (data || []).map((b) => ({
      ...b,
      seats_left:
        b.seat_limit !== null ? Math.max(0, b.seat_limit - b.seats_taken) : null,
    }));

    return NextResponse.json({ batches });
  } catch {
    return NextResponse.json({ batches: [] });
  }
}
