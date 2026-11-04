import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

/** Public: open batches for website (schedule + tabs) */
export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("batches")
      .select(
        "id, name, short_label, start_date, end_date, schedule_text, schedule_sessions, price_inr, display_price_inr, seat_limit, seats_taken, is_open, display_order"
      )
      .eq("is_open", true)
      .order("display_order", { ascending: true })
      .order("start_date", { ascending: true });

    if (error) {
      return NextResponse.json({ batches: [], error: error.message }, { status: 500 });
    }

    const batches = (data || []).map((b) => ({
      ...b,
      seats_left:
        b.seat_limit != null ? Math.max(0, b.seat_limit - (b.seats_taken || 0)) : null,
      schedule_sessions: Array.isArray(b.schedule_sessions) ? b.schedule_sessions : [],
      label: b.short_label || b.name,
    }));

    return NextResponse.json({ batches });
  } catch (e) {
    return NextResponse.json({ batches: [], error: e?.message }, { status: 500 });
  }
}