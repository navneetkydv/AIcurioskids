import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const batchId = searchParams.get("batch_id");

  const supabase = getServiceSupabase();
  let q = supabase
    .from("enrollments")
    .select(
      "id, parent_name, parent_email, parent_phone, child_first_name, child_class, city, status, created_at, utm_source, utm_medium, utm_campaign, batch_id, batches(name, start_date, price_inr)"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (status) q = q.eq("status", status);
  if (batchId) q = q.eq("batch_id", batchId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });

  const rows = (data || []).map((e) => ({
    ...e,
    batch_name: e.batches?.name,
    batch_start: e.batches?.start_date,
    price_inr: e.batches?.price_inr,
    batches: undefined,
  }));

  return NextResponse.json({ enrollments: rows });
}
