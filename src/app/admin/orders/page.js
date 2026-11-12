"use client";

import { useEffect, useState } from "react";
import { STATUS_LABELS, TRANSITIONS } from "@/lib/orderStatus";
import { formatOrderNo } from "@/lib/book";
import AdminNav from "@/components/admin/AdminNav";


const TABS = [
  { value: "paid", label: "To ship" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "pending", label: "Unpaid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "", label: "All" },
];

const BADGE = {
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-amber-100 text-amber-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-secondary)]";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function OrderPanel({ order, onSaved }) {
  const [status, setStatus] = useState(order.status);
  const [courier, setCourier] = useState(order.courier || "");
  const [tracking, setTracking] = useState(order.tracking_id || "");
  const [notes, setNotes] = useState(order.crm_notes || "");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  const options = [order.status, ...(TRANSITIONS[order.status] || [])];
  const markingShipped = status === "shipped" && order.status !== "shipped";
  const cancellingPaid = status === "cancelled" && order.status === "paid";

  const addressText = [
    order.customer_name,
    order.phone,
    order.address_line1,
    order.address_line2,
    order.landmark && `Landmark: ${order.landmark}`,
    `${order.city}, ${order.state} - ${order.pincode}`,
  ]
    .filter(Boolean)
    .join("\n");

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(addressText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const body = { courier, tracking_id: tracking, crm_notes: notes };
      if (status !== order.status) body.status = status;
      if (markingShipped) body.notify_customer = notify;

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: json.error || "Update failed" });
        return;
      }
      onSaved(json.order);
      setMsg({ type: "ok", text: "Saved" });
    } catch {
      setMsg({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Details */}
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-1 font-medium">Contact</p>
          <p><a href={`tel:${order.phone}`} className="underline">{order.phone}</a></p>
          <p><a href={`mailto:${order.email}`} className="break-all underline">{order.email}</a></p>
          <p className="text-[var(--color-muted)]">Class {order.child_class}</p>
        </div>

        <div>
          <p className="mb-1 font-medium">Delivery address</p>
          <p>{order.address_line1}</p>
          {order.address_line2 && <p>{order.address_line2}</p>}
          {order.landmark && <p>Landmark: {order.landmark}</p>}
          <p>{order.city}, {order.state} - {order.pincode}</p>
          <button type="button" onClick={copyAddress} className="mt-2 text-[var(--color-secondary)] underline">
            {copied ? "Copied!" : "Copy for courier label"}
          </button>
        </div>

        <div className="text-[var(--color-muted)]">
          <p className="mb-1 font-medium text-[var(--color-body)]">Payment</p>
          <p className="break-all">Razorpay order: {order.razorpay_order_id || "—"}</p>
          <p className="break-all">Payment ID: {order.razorpay_payment_id || "—"}</p>
          <p>Paid: {fmtDate(order.paid_at)}</p>
          {order.shipped_at && <p>Shipped: {fmtDate(order.shipped_at)}</p>}
          {order.delivered_at && <p>Delivered: {fmtDate(order.delivered_at)}</p>}
        </div>
      </div>

      {/* Edit */}
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor={`st-${order.id}`}>Status</label>
          <select id={`st-${order.id}`} value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            {options.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {cancellingPaid && (
            <p className="mt-1 text-xs text-amber-700">
              Cancelling does not refund the customer. Issue the refund from the Razorpay dashboard.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor={`co-${order.id}`}>Courier</label>
            <input id={`co-${order.id}`} value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. India Post" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor={`tr-${order.id}`}>Tracking ID</label>
            <input id={`tr-${order.id}`} value={tracking} onChange={(e) => setTracking(e.target.value)} className={inputCls} />
          </div>
        </div>

        {markingShipped && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Email the customer the tracking details
          </label>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor={`nt-${order.id}`}>Internal notes</label>
          <textarea id={`nt-${order.id}`} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to admins" className={inputCls} />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary !px-5 !py-2 text-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
          {msg && (
            <p className={`text-sm ${msg.type === "ok" ? "text-[var(--color-success)]" : "text-red-600"}`} role={msg.type === "error" ? "alert" : "status"}>
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [tab, setTab] = useState("paid");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ orders: [], total: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (tab) params.set("status", tab);
        if (debouncedQ) params.set("q", debouncedQ);
        params.set("page", String(page));
        const res = await fetch(`/api/admin/orders?${params}`, { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Failed to load orders");
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) setError("Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedQ, page]);

  function handleSaved(updated) {
    setData((d) => ({
      ...d,
      orders: d.orders.map((o) => (o.id === updated.id ? updated : o)),
    }));
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <main className="container-wide py-8">
      <h1 className="mb-6 text-2xl md:text-3xl">Book orders</h1>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => {
                setTab(t.value);
                setPage(1);
                setOpenId(null);
              }}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                tab === t.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-gray-300 bg-white text-[var(--color-body)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order no, name, phone, email, tracking"
          aria-label="Search orders"
          className={`${inputCls} md:max-w-sm`}
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
      {loading && <p className="mb-4 text-sm text-[var(--color-muted)]">Loading…</p>}

      {!loading && !error && data.orders.length === 0 && (
        <p className="py-10 text-center text-[var(--color-muted)]">No orders found.</p>
      )}

      <div className="space-y-3">
        {data.orders.map((o) => {
          const open = openId === o.id;
          return (
            <article key={o.id} className="card overflow-hidden !p-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o.id)}
                aria-expanded={open}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <p className="font-semibold">
                    {formatOrderNo(o.order_no)} · {o.customer_name}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {fmtDate(o.created_at)} · Class {o.child_class} · {o.city}, {o.state}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">₹{o.amount_inr.toLocaleString("en-IN")}</span>
                  <StatusBadge status={o.status} />
                </div>
              </button>

              {open && (
                <div className="border-t border-[var(--color-section)] p-4">
                  <OrderPanel order={o} onSaved={handleSaved} />
                </div>
              )}
            </article>
          );
        })}
      </div>

      {data.total > data.pageSize && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-4 !py-2 disabled:opacity-50">
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-4 !py-2 disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </main>
  );
}