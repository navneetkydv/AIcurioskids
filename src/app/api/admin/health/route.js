import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

  const report = {
    urlHost: url
      ? (() => {
          try {
            return new URL(url).host;
          } catch {
            return "invalid-url";
          }
        })()
      : "missing",
    hasServiceKey: Boolean(serviceKey),
    keyPrefix: serviceKey.slice(0, 12),
  };

  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, report, error: "Missing env vars" }, { status: 500 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error, status } = await supabase.from("batches").select("id, name").limit(3);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          report,
          supabaseStatus: status,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      report,
      sampleRows: data?.length ?? 0,
      names: (data || []).map((r) => r.name),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, report, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}