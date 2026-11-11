import { NextResponse, after } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  sendEnrollmentConfirmation,
  sendAdminNotification,
} from "@/lib/resend";
import { confirmBookOrder, sendBookEmails } from "@/lib/bookOrders";

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventId = req.headers.get("x-razorpay-event-id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Idempotency: only a unique-violation means "already seen"
  const { error: insertErr } = await supabase.from("webhook_events").insert({
    id: eventId,
    event_type: event.event,
    payload: event,
  });
  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("webhook_events insert failed:", insertErr);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id || event.payload?.order?.entity?.id;
      if (!orderId) return NextResponse.json({ ok: true });
      // --- Book orders ---
      const { data: bookOrder, error: bookErr } = await supabase
        .from("book_orders")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();
      if (bookErr) throw bookErr;

      if (bookOrder) {
        if (
          payment?.amount != null &&
          payment.amount !== bookOrder.amount_inr * 100
        ) {
          console.error("Book order amount mismatch", {
            orderId,
            got: payment.amount,
          });
          return NextResponse.json({ ok: true }); // needs manual review
        }
        const confirmed = await confirmBookOrder(supabase, {
          bookOrderId: bookOrder.id,
          paymentId: payment?.id,
        });
        if (confirmed) after(() => sendBookEmails(confirmed));
        return NextResponse.json({ ok: true });
      }
      // --- existing enrollment flow continues below ---
      const { data: payRow, error: payErr } = await supabase
        .from("payments")
        .select("*, enrollments(*, batches(*))")
        .eq("razorpay_order_id", orderId)
        .single();

      if (payErr || !payRow) {
        throw new Error(`No payments row for order ${orderId}`);
      }

      // Amount must match what we charged (paise)
      if (
        payment?.amount != null &&
        payment.amount !== payRow.amount_inr * 100
      ) {
        console.error("Amount mismatch", { orderId, got: payment.amount });
        return NextResponse.json({ ok: true }); // needs manual review; retrying won't help
      }

      const { data: confirmed, error: rpcErr } = await supabase.rpc(
        "confirm_enrollment_seat",
        {
          p_enrollment_id: payRow.enrollment_id,
          p_payment_id: payment?.id || payRow.razorpay_payment_id || "",
          p_order_id: orderId,
          p_amount: payRow.amount_inr,
          p_raw: event,
        },
      );
      if (rpcErr) throw rpcErr;

      const enr = payRow.enrollments;
      if (confirmed && enr) {
        // Respond to Razorpay first; send emails afterwards
        after(async () => {
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
          } catch (e) {
            console.error("Confirmation email failed:", e);
          }
        });
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        // Never overwrite a payment that already succeeded
        await supabase
          .from("payments")
          .update({ status: "failed", raw_payload: event })
          .eq("razorpay_order_id", payment.order_id)
          .eq("status", "created");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Webhook processing failed:", e);
    // Let Razorpay retry: forget this event id so the retry isn't skipped
    await supabase.from("webhook_events").delete().eq("id", eventId);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
