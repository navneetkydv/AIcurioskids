import { NextResponse, after } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";
import { TRANSITIONS } from "@/lib/orderStatus";
import { sendBookShippedEmail } from "@/lib/bookOrders";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRACKING_RE = /^[A-Za-z0-9\-_/. ]{3,60}$/;

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function PATCH(req, { params }) {
  const { ok } = await requireAdmin();
  if (!ok) return bad("Unauthorized", 401);

  const { id } = await params;
  if (!UUID_RE.test(id)) return bad("Order not found", 404);

  let body;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request");
  }

  const supabase = getServiceSupabase();
  const { data: order, error: loadErr } = await supabase
    .from("book_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadErr) {
    console.error("admin order load failed:", loadErr);
    return bad("Failed to load order", 500);
  }
  if (!order) return bad("Order not found", 404);

  const now = new Date().toISOString();
  const updates = { updated_at: now };

  if (body.crm_notes != null) {
    const notes = String(body.crm_notes);
    if (notes.length > 5000) return bad("Notes are too long (max 5000 characters)");
    updates.crm_notes = notes;
  }

  if (body.courier != null) {
    const courier = String(body.courier).trim();
    if (courier.length > 60) return bad("Courier name is too long");
    updates.courier = courier || null;
  }

  if (body.tracking_id != null) {
    const tracking = String(body.tracking_id).trim();
    if (tracking && !TRACKING_RE.test(tracking)) {
      return bad("Tracking ID can only contain letters, numbers, spaces and - _ / . (3 to 60 characters)");
    }
    updates.tracking_id = tracking || null;
  }

  const nextStatus = body.status != null ? String(body.status) : order.status;
  const statusChanged = nextStatus !== order.status;

  if (statusChanged) {
    if (!(TRANSITIONS[order.status] || []).includes(nextStatus)) {
      return bad(`An order that is "${order.status}" cannot be changed to "${nextStatus}"`);
    }
    updates.status = nextStatus;
    if (nextStatus === "shipped") {
      updates.shipped_at = order.shipped_at || now;
      updates.delivered_at = null;
    }
    if (nextStatus === "delivered") updates.delivered_at = now;
    if (nextStatus === "paid") {
      updates.shipped_at = null;
      updates.delivered_at = null;
    }
  }

  const finalTracking = "tracking_id" in updates ? updates.tracking_id : order.tracking_id;
  if ((nextStatus === "shipped" || nextStatus === "delivered") && !finalTracking) {
    return bad("Add a tracking ID before marking the order as shipped.");
  }

  // Only apply if the status is still what we loaded (guards against two admins at once)
  const { data: updated, error } = await supabase
    .from("book_orders")
    .update(updates)
    .eq("id", id)
    .eq("status", order.status)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("admin order update failed:", error);
    return bad("Update failed", 500);
  }
  if (!updated) {
    return bad("This order was changed by someone else. Reload and try again.", 409);
  }

  if (statusChanged && nextStatus === "shipped" && body.notify_customer) {
    after(() => sendBookShippedEmail(updated));
  }

  return NextResponse.json({ order: updated });
}