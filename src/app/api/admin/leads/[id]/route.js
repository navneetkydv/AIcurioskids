import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function PATCH(req, { params }) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const updates = {};

  if (body.crm_status != null) updates.crm_status = String(body.crm_status);
  if (body.crm_notes != null) updates.crm_notes = String(body.crm_notes);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          "Update failed.",
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ lead: data });
}