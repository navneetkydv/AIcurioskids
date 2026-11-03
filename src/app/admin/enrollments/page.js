"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminEnrollmentsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  async function load(s = status) {
    const qs = s ? `?status=${encodeURIComponent(s)}` : "";
    const res = await fetch(`/api/admin/enrollments${qs}`);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    setRows(data.enrollments || []);
  }

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/admin/auth/me");
      if (!me.ok) {
        router.replace("/admin/login");
        return;
      }
      const d = await me.json();
      setEmail(d.email || "");
      const initial = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("status") || ""
        : "";
      if (initial) setStatus(initial);
      await load(initial);
    })();
  }, [router]);

  async function updateStatus(id, next) {
    await fetch(`/api/admin/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await load();
  }

  function exportCSV() {
    const header = "parent,email,phone,child,class,city,status,batch,utm_source,created";
    const lines = rows.map((e) =>
      [
        e.parent_name,
        e.parent_email,
        e.parent_phone,
        e.child_first_name,
        e.child_class,
        e.city,
        e.status,
        e.batch_name || "",
        e.utm_source || "",
        e.created_at,
      ]
        .map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
  }

  return (
    <>
      <AdminNav email={email} />
      <div className="container-wide py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-[var(--color-primary)]">Enrollments</h1>
          <div className="flex gap-2 items-center">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                load(e.target.value);
              }}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <button type="button" onClick={exportCSV} className="btn-secondary !py-2 !px-3 text-sm">
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-3">Parent</th>
                <th className="py-2 pr-3">Child</th>
                <th className="py-2 pr-3">Batch</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">UTM</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{e.parent_name}</div>
                    <div className="text-xs text-[var(--color-muted)]">{e.parent_email}</div>
                    <div className="text-xs text-[var(--color-muted)]">{e.parent_phone}</div>
                  </td>
                  <td className="py-2 pr-3">
                    {e.child_first_name} · Class {e.child_class}
                    <div className="text-xs text-[var(--color-muted)]">{e.city}</div>
                  </td>
                  <td className="py-2 pr-3">{e.batch_name || "—"}</td>
                  <td className="py-2 pr-3">{e.status}</td>
                  <td className="py-2 pr-3 text-xs">{e.utm_source || "—"}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className="text-xs border rounded-lg px-2 py-1"
                      value={e.status}
                      onChange={(ev) => updateStatus(e.id, ev.target.value)}
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="refunded">refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="text-sm text-[var(--color-muted)] py-6">No enrollments found.</p>
          )}
        </div>
      </div>
    </>
  );
}
