import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

function normalizeSessions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (row.isWeekHeader || row.week) {
        return {
          isWeekHeader: true,
          week: String(row.week || "Week").trim(),
        };
      }
      return {
        day: String(row.day || "").trim(),
        morning: row.morning ? String(row.morning).trim() : null,
        evening: row.evening ? String(row.evening).trim() : null,
      };
    })
    .filter((row) => row.isWeekHeader || row.day);
}

export async function GET() {
  try {
    const { ok } = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing Supabase env vars" },
        { status: 500 }
      );
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("display_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      );
    }
    return NextResponse.json({ batches: data || [] });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { ok } = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const name = String(body.name || "").trim();
    const short_label = body.short_label ? String(body.short_label).trim() : null;
    const start_date = body.start_date;
    const end_date = body.end_date;
    const schedule_text = String(body.schedule_text || "").trim();
    const price_inr = parseInt(body.price_inr, 10);
    const display_price_inr =
      body.display_price_inr === "" || body.display_price_inr == null
        ? null
        : parseInt(body.display_price_inr, 10);
    const seat_limit =
      body.seat_limit === "" || body.seat_limit == null
        ? null
        : parseInt(body.seat_limit, 10);
    const is_open = body.is_open !== false;
    const display_order = parseInt(body.display_order, 10) || 0;
    const schedule_sessions = normalizeSessions(body.schedule_sessions);

    if (!name || !start_date || !end_date || !price_inr || price_inr <= 0) {
      return NextResponse.json(
        { error: "Missing required fields (name, dates, price)" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("batches")
      .insert({
        name,
        short_label,
        start_date,
        end_date,
        schedule_text,
        price_inr,
        display_price_inr,
        seat_limit,
        is_open,
        seats_taken: 0,
        display_order,
        schedule_sessions,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message || "Could not create batch",
          code: error.code,
          details: error.details,
          hint:
            error.message?.includes("schedule_sessions") || error.code === "42703"
              ? "Run migration 003_batch_schedule.sql in Supabase SQL Editor."
              : undefined,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ batch: data });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}