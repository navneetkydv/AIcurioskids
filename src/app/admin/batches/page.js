"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

const emptyForm = {
  name: "",
  start_date: "",
  end_date: "",
  schedule_text: "",
  price_inr: "",
  seat_limit: "",
  is_open: true,
};

export default function AdminBatchesPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function ensureAuth() {
    const me = await fetch("/api/admin/auth/me");
    if (!me.ok) {
      router.replace("/admin/login");
      return false;
    }
    const d = await me.json();
    setEmail(d.email || "");
    return true;
  }

  async function load() {
    const res = await fetch("/api/admin/batches");
    if (!res.ok) return;
    const data = await res.json();
    setBatches(data.batches || []);
  }

  useEffect(() => {
    (async () => {
      if (await ensureAuth()) await load();
    })();
  }, [router]);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const url = editingId ? `/api/admin/batches/${editingId}` : "/api/admin/batches";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Save failed");
      } else {
        setMsg(editingId ? "Batch updated" : "Batch created");
        setForm(emptyForm);
        setEditingId(null);
        await load();
      }
    } catch {
      setMsg("Network error");
    }
    setLoading(false);
  }

  function startEdit(b) {
    setEditingId(b.id);
    setForm({
      name: b.name || "",
      start_date: b.start_date || "",
      end_date: b.end_date || "",
      schedule_text: b.schedule_text || "",
      price_inr: String(b.price_inr || ""),
      seat_limit: b.seat_limit == null ? "" : String(b.seat_limit),
      is_open: Boolean(b.is_open),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleOpen(b) {
    await fetch(`/api/admin/batches/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_open: !b.is_open }),
    });
    await load();
  }

  async function remove(b) {
    if (!confirm(`Delete or close "${b.name}"?`)) return;
    const res = await fetch(`/api/admin/batches/${b.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.closed) setMsg("Batch has enrollments — closed instead of deleted");
    await load();
  }

  return (
    <>
      <AdminNav email={email} />
      <div className="container-wide py-8">
        <h1 className="text-2xl font-semibold text-[var(--color-primary)] mb-6">
          Courses / Batches
        </h1>

        <form onSubmit={onSubmit} className="card mb-10 space-y-4 max-w-2xl">
          <h2 className="font-semibold">{editingId ? "Edit batch" : "Create new batch"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Name</label>
              <input name="name" value={form.name} onChange={onChange} required className="w-full mt-1 rounded-xl border px-3 py-2" placeholder="November 2026 Batch" />
            </div>
            <div>
              <label className="text-sm font-medium">Start date</label>
              <input type="date" name="start_date" value={form.start_date} onChange={onChange} required className="w-full mt-1 rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">End date</label>
              <input type="date" name="end_date" value={form.end_date} onChange={onChange} required className="w-full mt-1 rounded-xl border px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Schedule text</label>
              <input name="schedule_text" value={form.schedule_text} onChange={onChange} className="w-full mt-1 rounded-xl border px-3 py-2" placeholder="2 sessions/week, 60 min · Weekday evenings" />
            </div>
            <div>
              <label className="text-sm font-medium">Price (INR)</label>
              <input type="number" name="price_inr" value={form.price_inr} onChange={onChange} required min={1} className="w-full mt-1 rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Seat limit (blank = unlimited)</label>
              <input type="number" name="seat_limit" value={form.seat_limit} onChange={onChange} min={1} className="w-full mt-1 rounded-xl border px-3 py-2" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_open" checked={form.is_open} onChange={onChange} />
              Open for enrollment
            </label>
          </div>
          {msg && <p className="text-sm text-[var(--color-secondary)]">{msg}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving…" : editingId ? "Update batch" : "Create batch"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Dates</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Seats</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-medium">{b.name}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {b.start_date} → {b.end_date}
                  </td>
                  <td className="py-2 pr-3">₹{b.price_inr}</td>
                  <td className="py-2 pr-3">
                    {b.seats_taken}
                    {b.seat_limit != null ? ` / ${b.seat_limit}` : ""}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={b.is_open ? "text-[var(--color-success)]" : "text-[var(--color-muted)]"}>
                      {b.is_open ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 space-x-2 whitespace-nowrap">
                    <button type="button" onClick={() => startEdit(b)} className="underline text-[var(--color-secondary)]">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleOpen(b)} className="underline">
                      {b.is_open ? "Close" : "Open"}
                    </button>
                    <button type="button" onClick={() => remove(b)} className="underline text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {batches.length === 0 && (
            <p className="text-sm text-[var(--color-muted)] py-6">No batches yet. Create one above.</p>
          )}
        </div>
      </div>
    </>
  );
}
