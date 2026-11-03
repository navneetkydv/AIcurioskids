import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const supabase = getServiceSupabase();
  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (status) query = query.eq("crm_status", status);

  const { data, error } = await query;
  if (error) {
    // crm_status column may not exist yet — fall back
    const fallback = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (fallback.error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    let rows = fallback.data || [];
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.phone?.includes(s)
      );
    }
    return NextResponse.json({ leads: rows });
  }

  let rows = data || [];
  if (q) {
    const s = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.phone?.includes(s)
    );
  }
  return NextResponse.json({ leads: rows });
}
