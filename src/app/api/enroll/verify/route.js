import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendEnrollmentConfirmation, sendAdminNotification } from "@/lib/resend";

export async function POST(req) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, enrollment_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const valid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Use atomic function
    const { data: ok, error } = await supabase.rpc("confirm_enrollment_seat", {
      p_enrollment_id: enrollment_id,
      p_payment_id: razorpay_payment_id,
      p_order_id: razorpay_order_id,
      p_amount: 0,
      p_raw: body,
    });

    if (error) {
      console.error("confirm rpc error");
      return NextResponse.json({ error: "Could not confirm" }, { status: 500 });
    }

    if (!ok) {
      return NextResponse.json({ error: "Seat unavailable or already processed" }, { status: 409 });
    }

    // Fetch details for email (best-effort)
    try {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("*, batches(*)")
        .eq("id", enrollment_id)
        .single();
      if (enr) {
        const batch = enr.batches ;
        await sendEnrollmentConfirmation({
          to: enr.parent_email,
          parentName: enr.parent_name,
          childName: enr.child_first_name,
          batchName: batch?.name || "AI Course",
          startDate: batch?.start_date || "",
          amount: batch?.price_inr || 0,
        });
        await sendAdminNotification({
          parentName: enr.parent_name,
          parentEmail: enr.parent_email,
          childName: enr.child_first_name,
          batchName: batch?.name || "AI Course",
          amount: batch?.price_inr || 0,
        });
      }
    } catch {
      // Email failure should not block UX
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
