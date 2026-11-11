import { NextResponse } from "next/server";
import { bookOrderSchema } from "@/lib/bookValidations";
import { BOOK_OFFER_PRICE_INR, BOOK_TITLE } from "@/lib/book";
import { getServiceSupabase } from "@/lib/supabase";
import { createRazorpayOrder, getRazorpayCredentials } from "@/lib/razorpay";

export async function POST(req) {
  try {
    const body = await req.json();

    if (body?.website) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 }); // honeypot
    }

    const parsed = bookOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the form and try again." },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const phone = `+91${data.phone.replace(/\D/g, "").slice(-10)}`;
    const supabase = getServiceSupabase();

    const { data: order, error: insertErr } = await supabase
      .from("book_orders")
      .insert({
        customer_name: data.customer_name,
        email: data.email,
        phone,
        child_class: Number(data.child_class),
        pincode: data.pincode,
        city: data.city,
        state: data.state,
        address_line1: data.address_line1,
        address_line2: data.address_line2 || null,
        landmark: data.landmark || null,
        amount_inr: BOOK_OFFER_PRICE_INR, // price decided on the server
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
      })
      .select("id, order_no")
      .single();

    if (insertErr || !order) {
      console.error("book_orders insert failed:", insertErr);
      return NextResponse.json({ error: "Could not create your order." }, { status: 500 });
    }

    const rzp = await createRazorpayOrder({
      amountInPaise: BOOK_PRICE_INR * 100,
      receipt: `book_${order.order_no}`,
      notes: { type: "book", book_order_id: order.id },
    });

    const { error: linkErr } = await supabase
      .from("book_orders")
      .update({ razorpay_order_id: rzp.id })
      .eq("id", order.id);

    if (linkErr) {
      console.error("Linking Razorpay order failed:", linkErr);
      return NextResponse.json({ error: "Could not create your order." }, { status: 500 });
    }

    const { keyId } = getRazorpayCredentials();

    return NextResponse.json({
      orderId: rzp.id,
      amount: rzp.amount,
      currency: rzp.currency,
      keyId,
      bookOrderId: order.id,
      customerName: data.customer_name,
      email: data.email,
      phone,
    });
  } catch (e) {
    console.error("book create-order error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}