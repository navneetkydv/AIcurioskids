import { formatOrderNo, BOOK_TITLE } from "@/lib/book";

// Returns the order row if THIS call confirmed it, or null if it was already confirmed.
export async function confirmBookOrder(supabase, { bookOrderId, paymentId }) {
  const { data, error } = await supabase
    .from("book_orders")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId || null,
      paid_at: new Date().toISOString(),
    })
    .eq("id", bookOrderId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function addressHtml(o) {
  return [o.address_line1, o.address_line2, o.landmark && `Landmark: ${o.landmark}`, `${o.city}, ${o.state} - ${o.pincode}`]
    .filter(Boolean)
    .map(esc)
    .join("<br>");
}

async function sendEmail({ to, subject, html }) {
  // Adjust the env names to match your existing Resend setup.
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

export async function sendBookEmails(order) {
  const no = formatOrderNo(order.order_no);

  try {
    await sendEmail({
      to: order.email,
      subject: `Order confirmed ${no} – ${BOOK_TITLE}`,
      html: `
        <p>Hi ${esc(order.customer_name)},</p>
        <p>Thank you! Your order <strong>${no}</strong> for the <strong>${esc(BOOK_TITLE)}</strong> book is confirmed.</p>
        <p><strong>Amount paid:</strong> ₹${order.amount_inr}</p>
        <p><strong>Delivery address:</strong><br>${addressHtml(order)}</p>
        <p>We will email you when the book is shipped. Questions? Just reply to this email.</p>`,
    });
  } catch (e) {
    console.error("Customer order email failed:", e);
  }

  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New book order ${no} – ₹${order.amount_inr}`,
      html: `
        <p><strong>${no}</strong> | Class ${order.child_class}</p>
        <p>${esc(order.customer_name)}<br>${esc(order.phone)}<br>${esc(order.email)}</p>
        <p>${addressHtml(order)}</p>`,
    });
  } catch (e) {
    console.error("Admin order email failed:", e);
  }
}

export async function sendBookShippedEmail(order) {
  const no = formatOrderNo(order.order_no);
  try {
    await sendEmail({
      to: order.email,
      subject: `Your book is on its way – ${no}`,
      html: `
        <p>Hi ${esc(order.customer_name)},</p>
        <p>Good news! Your order <strong>${no}</strong> has been shipped.</p>
        <p>${order.courier ? `<strong>Courier:</strong> ${esc(order.courier)}<br>` : ""}
           <strong>Tracking ID:</strong> ${esc(order.tracking_id)}</p>
        <p><strong>Delivering to:</strong><br>${addressHtml(order)}</p>`,
    });
  } catch (e) {
    console.error("Shipped email failed:", e);
  }
}