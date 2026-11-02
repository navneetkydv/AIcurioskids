import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validations";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    // Honeypot
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const { name, email, phone, message } = parsed.data;
    const supabase = getServiceSupabase();

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone: phone.startsWith("+") ? phone : `+91${phone.replace(/^0/, "")}`,
      message: message || null,
      source: body.source || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
    });

    if (error) {
      console.error("Lead insert error");
      return NextResponse.json({ error: "Could not save" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
