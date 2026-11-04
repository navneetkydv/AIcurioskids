import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

function normalizeSessions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (row.isWeekHeader || (row.week && !row.day)) {
        return { isWeekHeader: true, week: String(row.week || "Week").trim() };
      }
      return {
        day: String(row.day || "").trim(),
        morning: row.morning ? String(row.morning).trim() : null,
        evening: row.evening ? String(row.evening).trim() : null,
      };
    })
    .filter((row) => row.isWeekHeader || row.day);
}

export async function PATCH(request, context) {
  try {
    const { ok } = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing batch id" }, { status: 400 });
    }

    const body = await request.json();
    const updates = {};

    if (body.name != null) updates.name = String(body.name).trim();
    if (body.short_label !== undefined) {
      updates.short_label = body.short_label
        ? String(body.short_label).trim()
        : null;
    }
    if (body.start_date != null) updates.start_date = body.start_date;
    if (body.end_date != null) updates.end_date = body.end_date;
    if (body.schedule_text != null) {
      updates.schedule_text = String(body.schedule_text).trim();
    }
    if (body.price_inr != null) updates.price_inr = parseInt(body.price_inr, 10);
    if (body.display_price_inr !== undefined) {
      updates.display_price_inr =
        body.display_price_inr === "" || body.display_price_inr == null
          ? null
          : parseInt(body.display_price_inr, 10);
    }
    if (body.seat_limit !== undefined) {
      updates.seat_limit =
        body.seat_limit === "" || body.seat_limit == null
          ? null
          : parseInt(body.seat_limit, 10);
    }
    if (body.is_open != null) updates.is_open = Boolean(body.is_open);
    if (body.display_order != null) {
      updates.display_order = parseInt(body.display_order, 10) || 0;
    }
    if (body.schedule_sessions != null) {
      updates.schedule_sessions = normalizeSessions(body.schedule_sessions);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("batches")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message || "Update failed",
          code: error.code,
          hint:
            error.code === "42703"
              ? "Run migrations 003 and 004 in Supabase SQL Editor."
              : undefined,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ batch: data });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const { ok } = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing batch id" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", id);

    if (count && count > 0) {
      const { data, error } = await supabase
        .from("batches")
        .update({ is_open: false })
        .eq("id", id)
        .select("*")
        .single();
      if (error) {
        return NextResponse.json({ error: "Could not close batch" }, { status: 500 });
      }
      return NextResponse.json({ batch: data, closed: true });
    }

    const { error } = await supabase.from("batches").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}