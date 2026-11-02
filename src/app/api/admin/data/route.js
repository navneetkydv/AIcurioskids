import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

/**
 * Minimal protection: require a shared secret header for phase 1.
 * Replace with proper Supabase Auth session checks before production.
 */
export async function GET(req) {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.ADMIN_API_SECRET || secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, parent_name, parent_email, child_first_name, child_class, city, status, created_at, batches(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, email, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (enrollments || []).map((e) => ({
    id: e.id,
    parent_name: e.parent_name,
    parent_email: e.parent_email,
    child_first_name: e.child_first_name,
    child_class: e.child_class,
    city: e.city,
    status: e.status,
    created_at: e.created_at,
    batch_name: e.batches?.name,
  }));

  return NextResponse.json({ enrollments: rows, leads: leads || [] });
}
