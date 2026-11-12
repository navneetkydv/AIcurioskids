"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

export default function AdminLeadsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [notesDraft, setNotesDraft] = useState({});

  async function load(opts = {}) {
    const params = new URLSearchParams();
    if (opts.status ?? status) params.set("status", opts.status ?? status);
    if (opts.q ?? q) params.set("q", opts.q ?? q);
    const res = await fetch(`/api/admin/leads?${params.toString()}`);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    setLeads(data.leads || []);
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
      await load({ status: "", q: "" });
    })();
  }, [router]);

  async function setLeadStatus(id, crm_status) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crm_status }),
    });
    if (!res.ok) {
      alert("Could not update status.");
      return;
    }
    await load();
  }

  async function saveNotes(id) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crm_notes: notesDraft[id] ?? "" }),
    });
    if (!res.ok) {
      alert("Could not save notes.");
      return;
    }
    await load();
  }

  function exportCSV() {
    const header = "name,email,phone,message,status,utm_source,created";
    const lines = leads.map((l) =>
      [
        l.name,
        l.email,
        l.phone,
        l.message || "",
        l.crm_status || "new",
        l.utm_source || "",
        l.created_at,
      ]
        .map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  }

  return (
    <>
      <AdminNav email={email} />
      <div className="container-wide py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-primary">Leads CRM</h1>
          <button type="button" onClick={exportCSV} className="btn-secondary !py-2 !px-3 text-sm">
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone"
            className="rounded-xl border px-3 py-2 text-sm min-w-[200px]"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary !py-2 !px-4 text-sm"
            onClick={() => load()}
          >
            Filter
          </button>
        </div>

        <div className="space-y-4">
          {leads.map((l) => (
            <div key={l.id} className="card">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{l.name}</p>
                  <p className="text-sm">
                    <a href={`mailto:${l.email}`} className="underline">
                      {l.email}
                    </a>
                    {" · "}
                    <a href={`tel:${l.phone}`} className="underline">
                      {l.phone}
                    </a>
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(l.created_at).toLocaleString()}
                    {l.utm_source ? ` · utm: ${l.utm_source}` : ""}
                  </p>
                </div>
                <select
                  className="text-sm border rounded-lg px-2 py-1 h-fit"
                  value={l.crm_status || "new"}
                  onChange={(e) => setLeadStatus(l.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {l.message && (
                <p className="text-sm text-muted mt-3 border-t pt-3">{l.message}</p>
              )}
              <div className="mt-3">
                <label className="text-xs font-medium text-muted">CRM notes</label>
                <textarea
                  className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  rows={2}
                  defaultValue={l.crm_notes || ""}
                  onChange={(e) =>
                    setNotesDraft((d) => ({ ...d, [l.id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="mt-2 text-sm underline text-secondary"
                  onClick={() => saveNotes(l.id)}
                >
                  Save notes
                </button>
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <p className="text-sm text-muted">No leads yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
