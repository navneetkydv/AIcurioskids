import { NextResponse, after } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { confirmBookOrder, sendBookEmails } from "@/lib/bookOrders";
import { formatOrderNo } from "@/lib/book";

export async function POST(req) {
  try {
    const { book_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!book_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data: order } = await supabase
      .from("book_orders")
      .select("*")
      .eq("id", book_order_id)
      .single();

    if (!order || !order.razorpay_order_id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Order id comes from OUR database, not from the browser
    const valid = verifyPaymentSignature(
      order.razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const confirmed = await confirmBookOrder(supabase, {
      bookOrderId: order.id,
      paymentId: razorpay_payment_id,
    });
    if (confirmed) after(() => sendBookEmails(confirmed));

    return NextResponse.json({ ok: true, orderNo: formatOrderNo(order.order_no) });
  } catch (e) {
    console.error("book verify error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}