import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();

  const [enr, leads, batches, paid] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, status, created_at", { count: "exact" }),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("batches").select("id, is_open, seats_taken, seat_limit"),
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
  ]);

  const statusCounts = { pending: 0, confirmed: 0, cancelled: 0, refunded: 0 };
  (enr.data || []).forEach((e) => {
    if (statusCounts[e.status] != null) statusCounts[e.status] += 1;
  });

  return NextResponse.json({
    stats: {
      totalEnrollments: enr.count || 0,
      confirmed: paid.count || statusCounts.confirmed,
      pending: statusCounts.pending,
      totalLeads: leads.count || 0,
      openBatches: (batches.data || []).filter((b) => b.is_open).length,
    },
    statusCounts,
  });
}
