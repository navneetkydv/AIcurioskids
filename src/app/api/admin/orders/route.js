import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";
import { STATUSES } from "@/lib/orderStatus";

const PAGE_SIZE = 25;

export async function GET(req) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const supabase = getServiceSupabase();
  let query = supabase
    .from("book_orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status && STATUSES.includes(status)) query = query.eq("status", status);

  if (q) {
    // Keep only characters that are safe inside a PostgREST filter string
    const s = q.replace(/[^a-zA-Z0-9@.+\- ]/g, "");
    if (s) {
      const filters = [
        `customer_name.ilike.%${s}%`,
        `email.ilike.%${s}%`,
        `phone.ilike.%${s}%`,
        `tracking_id.ilike.%${s}%`,
      ];
      const orderNo = s.replace(/^aik-?/i, "");
      if (/^\d+$/.test(orderNo)) filters.push(`order_no.eq.${orderNo}`);
      query = query.or(filters.join(","));
    }
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("admin orders list failed:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }

  return NextResponse.json({
    orders: data || [],
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
  });
}