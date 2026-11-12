import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") || "30", 10) || 30));
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getServiceSupabase().rpc("traffic_summary", { p_from: from });
  if (error) {
    console.error("traffic_summary failed:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }

  return NextResponse.json({ days, summary: data });
}