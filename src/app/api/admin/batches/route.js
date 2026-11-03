import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("batches")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  return NextResponse.json({ batches: data || [] });
}

export async function POST(req) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = String(body.name || "").trim();
  const start_date = body.start_date;
  const end_date = body.end_date;
  const schedule_text = String(body.schedule_text || "").trim();
  const price_inr = parseInt(body.price_inr, 10);
  const seat_limit =
    body.seat_limit === "" || body.seat_limit == null
      ? null
      : parseInt(body.seat_limit, 10);
  const is_open = body.is_open !== false;

  if (!name || !start_date || !end_date || !price_inr || price_inr <= 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("batches")
    .insert({
      name,
      start_date,
      end_date,
      schedule_text,
      price_inr,
      seat_limit,
      is_open,
      seats_taken: 0,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "Could not create batch" }, { status: 500 });
  return NextResponse.json({ batch: data });
}
