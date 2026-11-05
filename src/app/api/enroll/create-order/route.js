import { NextResponse } from "next/server";
import { enrollSchema, CONSENT_TEXT_VERSION } from "@/lib/validations";
import { getServiceSupabase } from "@/lib/supabase";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = enrollSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const data = parsed.data;
    const supabase = getServiceSupabase();

    // Fetch batch server-side — never trust client price
    const { data: batch, error: batchErr } = await supabase
      .from("batches")
      .select("*")
      .eq("id", data.batch_id)
      .eq("is_open", true)
      .single();

    if (batchErr || !batch) {
      return NextResponse.json({ error: "Batch not available" }, { status: 400 });
    }

    if (batch.seat_limit !== null && batch.seats_taken >= batch.seat_limit) {
      return NextResponse.json({ error: "Batch is full" }, { status: 400 });
    }

    const phone = data.parent_phone.startsWith("+")
      ? data.parent_phone
      : `+91${data.parent_phone.replace(/^0/, "")}`;

    // Create enrollment pending
    const { data: enrollment, error: enrErr } = await supabase
      .from("enrollments")
      .insert({
        batch_id: data.batch_id,
        parent_name: data.parent_name,
        parent_email: data.parent_email,
        parent_phone: phone,
        child_first_name: data.child_first_name,
        child_class: data.child_class,
        city: data.city,
        consent_given: false,
        consent_at: null,
        consent_text_version: null,
        status: "pending",
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
      })
      .select("id")
      .single();

   if (enrErr || !enrollment) {
  console.error("Enrollment insert failed:", enrErr);

  return NextResponse.json(
    {
      error: "Could not create enrollment",
      details: enrErr?.message,
      code: enrErr?.code,
      hint: enrErr?.hint,
      detailsFromDatabase: enrErr?.details,
    },
    { status: 500 }
  );
}

    const amountPaise = batch.price_inr * 100;
    const order = await createRazorpayOrder({
      amountInPaise: amountPaise,
      receipt: `enr_${enrollment.id.slice(0, 8)}`,
      notes: {
        enrollment_id: enrollment.id,
        batch_id: data.batch_id,
      },
    });

    // Store payment row
    await supabase.from("payments").insert({
      enrollment_id: enrollment.id,
      razorpay_order_id: order.id,
      amount_inr: batch.price_inr,
      currency: "INR",
      status: "created",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      enrollmentId: enrollment.id,
      batchName: batch.name,
      parentName: data.parent_name,
      parentEmail: data.parent_email,
      parentPhone: phone,
    });
  } catch (e) {
    console.error("create-order error");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
