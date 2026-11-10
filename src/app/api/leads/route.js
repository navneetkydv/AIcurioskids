
import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validations";
import { getServiceSupabase } from "@/lib/supabase";

const resources = {
  "course-brochure": {
    message: "Course brochure download request",
    source: "brochure",
    downloadUrl: "/brochure.pdf",
  },
  "book-sample": {
    message: "AI book sample download request",
    source: "book-sample",
    downloadUrl: "/book-sample.pdf",
  },
};

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate request
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Honeypot spam protection
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const {
      name,
      email,
      phone,
      resourceType,
      utm_source,
      utm_medium,
      utm_campaign,
    } = parsed.data;

    const resource = resources[resourceType];

    const supabase = getServiceSupabase();

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone: phone.startsWith("+")
        ? phone
        : `+91${phone.replace(/^0/, "")}`,
      message: resource.message,
      source: resource.source,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    });

    if (error) {
      console.error("Lead insert error");
      return NextResponse.json(
        { error: "Could not save" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      downloadUrl: resource.downloadUrl,
    });

  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
