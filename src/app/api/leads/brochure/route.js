import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Valid Indian mobile required"),
  website: z.string().max(0).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export async function POST(req) {
  try {
    const body = await req.json();
    if (body.website) return NextResponse.json({ ok: true });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone } = parsed.data;
    const phoneNorm = phone.startsWith("+")
      ? phone
      : `+91${phone.replace(/^0/, "")}`;

    const supabase = getServiceSupabase();
    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone: phoneNorm,
      message: "Brochure download request",
      source: "brochure",
      utm_source: parsed.data.utm_source || null,
      utm_medium: parsed.data.utm_medium || null,
      utm_campaign: parsed.data.utm_campaign || null,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not save lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      downloadUrl: "/brochure.pdf",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}