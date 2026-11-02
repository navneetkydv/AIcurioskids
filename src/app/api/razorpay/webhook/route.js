import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendEnrollmentConfirmation, sendAdminNotification } from "@/lib/resend";

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Idempotency
  const { error: insertErr } = await supabase.from("webhook_events").insert({
    id: event.id,
    event_type: event.event,
    payload: event,
  });
  if (insertErr) {
    // Duplicate event id → already processed
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const eventType = event.event;

  if (eventType === "payment.captured" || eventType === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const order = event.payload?.order?.entity;
    const orderId = payment?.order_id || order?.id;
    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const { data: payRow } = await supabase
      .from("payments")
      .select("*, enrollments(*, batches(*))")
      .eq("razorpay_order_id", orderId)
      .single();

    if (!payRow) {
      return NextResponse.json({ ok: true });
    }

    const enrollmentId = payRow.enrollment_id;
    const paymentId = payment?.id || payRow.razorpay_payment_id || "";

    const { data: confirmed } = await supabase.rpc("confirm_enrollment_seat", {
      p_enrollment_id: enrollmentId,
      p_payment_id: paymentId,
      p_order_id: orderId,
      p_amount: payRow.amount_inr,
      p_raw: event,
    });

    if (confirmed && payRow.enrollments) {
      const enr = payRow.enrollments;
      try {
        await sendEnrollmentConfirmation({
          to: enr.parent_email,
          parentName: enr.parent_name,
          childName: enr.child_first_name,
          batchName: enr.batches?.name || "AI Course",
          startDate: enr.batches?.start_date || "",
          amount: enr.batches?.price_inr || payRow.amount_inr,
        });
        await sendAdminNotification({
          parentName: enr.parent_name,
          parentEmail: enr.parent_email,
          childName: enr.child_first_name,
          batchName: enr.batches?.name || "AI Course",
          amount: enr.batches?.price_inr || payRow.amount_inr,
        });
      } catch {
        // ignore email errors
      }
    }
  }

  if (eventType === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      await supabase
        .from("payments")
        .update({ status: "failed", raw_payload: event })
        .eq("razorpay_order_id", payment.order_id);
    }
  }

  return NextResponse.json({ ok: true });
}
