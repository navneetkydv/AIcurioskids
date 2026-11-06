"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

const emptyForm = {
  name: "",
  short_label: "",
  start_date: "",
  end_date: "",
  schedule_text: "",
  price_inr: "",
  display_price_inr: "",
  seat_limit: "",
  is_open: true,
  display_order: "0",
  schedule_sessions: [],
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMsg(err.error || "Failed to load batches");
      return;
    }
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

  function addWeekHeader() {
    setForm((f) => ({
      ...f,
      schedule_sessions: [
        ...f.schedule_sessions,
        { isWeekHeader: true, week: `Week ${countWeeks(f.schedule_sessions) + 1}` },
      ],
    }));
  }

  function addSession() {
    setForm((f) => ({
      ...f,
      schedule_sessions: [
        ...f.schedule_sessions,
        { day: "", morning: "", evening: "" },
      ],
    }));
  }

  function updateSession(index, field, value) {
    setForm((f) => {
      const next = [...f.schedule_sessions];
      next[index] = { ...next[index], [field]: value };
      return { ...f, schedule_sessions: next };
    });
  }

  function removeSession(index) {
    setForm((f) => ({
      ...f,
      schedule_sessions: f.schedule_sessions.filter((_, i) => i !== index),
    }));
  }

  function countWeeks(sessions) {
    return sessions.filter((s) => s.isWeekHeader).length;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const payload = {
        ...form,
        schedule_sessions: form.schedule_sessions.map((s) =>
          s.isWeekHeader
            ? { isWeekHeader: true, week: s.week }
            : {
                day: s.day,
                morning: s.morning || null,
                evening: s.evening || null,
              }
        ),
      };
      const url = editingId ? `/api/admin/batches/${editingId}` : "/api/admin/batches";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.hint ? `${data.error} (${data.hint})` : data.error || "Save failed");
      } else {
        setMsg(editingId ? "Batch updated — live on website" : "Batch created — live on website");
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
      short_label: b.short_label || "",
      start_date: b.start_date || "",
      end_date: b.end_date || "",
      schedule_text: b.schedule_text || "",
      price_inr: String(b.price_inr || ""),
      display_price_inr: b.display_price_inr == null ? "" : String(b.display_price_inr),
      seat_limit: b.seat_limit == null ? "" : String(b.seat_limit),
      is_open: Boolean(b.is_open),
      display_order: String(b.display_order ?? 0),
      schedule_sessions: Array.isArray(b.schedule_sessions)
        ? b.schedule_sessions.map((s) =>
            s.isWeekHeader
              ? { isWeekHeader: true, week: s.week || "" }
              : {
                  day: s.day || "",
                  morning: s.morning || "",
                  evening: s.evening || "",
                }
          )
        : [],
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
        <h1 className="text-2xl font-semibold text-primary mb-2">
          Courses / Batches
        </h1>
        <p className="text-sm text-muted mb-6">
          Open batches appear on the website (home + enroll). Set session days and optional
          morning/evening slots below.
        </p>

        <form onSubmit={onSubmit} className="card mb-10 space-y-4 max-w-3xl">
          <h2 className="font-semibold">{editingId ? "Edit batch" : "Create new batch"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className="w-full mt-1 rounded-xl border px-3 py-2"
                placeholder="November 2026 Batch"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tab label (e.g. Batch I)</label>
              <input
                name="short_label"
                value={form.short_label}
                onChange={onChange}
                className="w-full mt-1 rounded-xl border px-3 py-2"
                placeholder="Batch I"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display order</label>
              <input
                type="number"
                name="display_order"
                value={form.display_order}
                onChange={onChange}
                className="w-full mt-1 rounded-xl border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start date</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={onChange}
                required
                className="w-full mt-1 rounded-xl border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End date</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={onChange}
                required
                className="w-full mt-1 rounded-xl border px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Short schedule summary</label>
              <input
                name="schedule_text"
                value={form.schedule_text}
                onChange={onChange}
                className="w-full mt-1 rounded-xl border px-3 py-2"
                placeholder="Weekends · Morning & evening slots"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Selling price (INR) — charged</label>
              <input
                type="number"
                name="price_inr"
                value={form.price_inr}
                onChange={onChange}
                required
                min={1}
                className="w-full mt-1 rounded-xl border px-3 py-2"
                placeholder="Actual amount paid via Razorpay"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display / list price (optional)</label>
              <input
                type="number"
                name="display_price_inr"
                value={form.display_price_inr}
                onChange={onChange}
                min={1}
                className="w-full mt-1 rounded-xl border px-3 py-2"
                placeholder="Shown struck-through if higher"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Seat limit (blank = unlimited)</label>
              <input
                type="number"
                name="seat_limit"
                value={form.seat_limit}
                onChange={onChange}
                min={1}
                className="w-full mt-1 rounded-xl border px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="is_open" checked={form.is_open} onChange={onChange} />
              Open for enrollment (shown on website)
            </label>
          </div>

          {/* Session schedule builder */}
          <div className="border-t pt-4 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-primary">Session timetable</h3>
              <div className="flex gap-2">
                <button type="button" onClick={addWeekHeader} className="text-sm btn-secondary !py-1.5 !px-3">
                  + Week header
                </button>
                <button type="button" onClick={addSession} className="text-sm btn-secondary !py-1.5 !px-3">
                  + Session day
                </button>
              </div>
            </div>
            <p className="text-xs text-muted mb-3">
              Leave Morning or Evening empty if that batch only runs in one slot.
            </p>
            <div className="space-y-3">
              {form.schedule_sessions.map((s, i) =>
                s.isWeekHeader ? (
                  <div key={i} className="flex gap-2 items-center bg-section rounded-xl p-3">
                    <span className="text-xs font-medium text-muted w-16">Week</span>
                    <input
                      value={s.week || ""}
                      onChange={(e) => updateSession(i, "week", e.target.value)}
                      className="flex-1 rounded-lg border px-2 py-1.5 text-sm"
                      placeholder="Week 1"
                    />
                    <button type="button" onClick={() => removeSession(i)} className="text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div key={i} className="grid sm:grid-cols-4 gap-2 items-end border rounded-xl p-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted">Day & date</label>
                      <input
                        value={s.day || ""}
                        onChange={(e) => updateSession(i, "day", e.target.value)}
                        className="w-full rounded-lg border px-2 py-1.5 text-sm"
                        placeholder="14th November 2026, Saturday"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted">Morning (optional)</label>
                      <input
                        value={s.morning || ""}
                        onChange={(e) => updateSession(i, "morning", e.target.value)}
                        className="w-full rounded-lg border px-2 py-1.5 text-sm"
                        placeholder="9:30 AM – 11:00 AM"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-muted">Evening (optional)</label>
                        <input
                          value={s.evening || ""}
                          onChange={(e) => updateSession(i, "evening", e.target.value)}
                          className="w-full rounded-lg border px-2 py-1.5 text-sm"
                          placeholder="4:30 PM – 6:00 PM"
                        />
                      </div>
                      <button type="button" onClick={() => removeSession(i)} className="text-red-600 text-sm pb-2">
                        ✕
                      </button>
                    </div>
                  </div>
                )
              )}
              {form.schedule_sessions.length === 0 && (
                <p className="text-sm text-muted">
                  No sessions yet. Add week headers and session days.
                </p>
              )}
            </div>
          </div>

          {msg && <p className="text-sm text-secondary">{msg}</p>}
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
                <th className="py-2 pr-3">Label</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Dates</th>
                <th className="py-2 pr-3">Sessions</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3">{b.short_label || "—"}</td>
                  <td className="py-2 pr-3 font-medium">{b.name}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {b.start_date} → {b.end_date}
                  </td>
                  <td className="py-2 pr-3">
                    {Array.isArray(b.schedule_sessions)
                      ? b.schedule_sessions.filter((s) => !s.isWeekHeader).length
                      : 0}{" "}
                    days
                  </td>
                  <td className="py-2 pr-3">
                    ₹{b.price_inr}
                    {b.display_price_inr && b.display_price_inr > b.price_inr ? (
                      <span className="text-muted line-through ml-1 text-xs">
                        ₹{b.display_price_inr}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={b.is_open ? "text-success" : "text-muted"}>
                      {b.is_open ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 space-x-2 whitespace-nowrap">
                    <button type="button" onClick={() => startEdit(b)} className="underline text-secondary">
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
        </div>
      </div>
    </>
  );
}