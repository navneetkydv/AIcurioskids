"use client";

import { useEffect, useState } from "react";

/**
 * Minimal admin UI – phase 1.
 * Protect this route with Supabase Auth + email allowlist in middleware (to be configured).
 * ASSUMPTION: You will add Supabase Auth and middleware to restrict /admin to ADMIN_EMAIL only.
 */

export default function AdminPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState("enrollments");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/data", {
          headers: {
            "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
          },
        });
        if (!res.ok) {
          setError("Unauthorized or server error. Configure admin auth / ADMIN_API_SECRET.");
          return;
        }
        const data = await res.json();
        setEnrollments(data.enrollments || []);
        setLeads(data.leads || []);
      } catch {
        setError("Could not load data");
      }
    }
    load();
  }, []);

  function exportCSV() {
    const rows = enrollments.map((e) =>
      [e.id, e.parent_name, e.parent_email, e.child_first_name, e.child_class, e.city, e.status, e.created_at, e.batch_name || ""].join(",")
    );
    const csv = ["id,parent_name,parent_email,child,class,city,status,created,batch", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
  }

  return (
    <section className="py-10">
      <div className="container-wide">
        <h1 className="text-2xl font-semibold mb-2">Admin</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          Phase 1 – simple list view. Protect with Supabase Auth allowlist.
        </p>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setTab("enrollments")}
            className={tab === "enrollments" ? "font-semibold underline" : ""}
          >
            Enrollments
          </button>
          <button
            type="button"
            onClick={() => setTab("leads")}
            className={tab === "leads" ? "font-semibold underline" : ""}
          >
            Leads
          </button>
          {tab === "enrollments" && (
            <button type="button" onClick={exportCSV} className="ml-auto text-sm btn-secondary !py-1.5 !px-3">
              Export CSV
            </button>
          )}
        </div>

        {tab === "enrollments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3">Parent</th>
                  <th className="py-2 pr-3">Child</th>
                  <th className="py-2 pr-3">Class</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3">
                      {e.parent_name}
                      <br />
                      <span className="text-xs text-[var(--color-muted)]">{e.parent_email}</span>
                    </td>
                    <td className="py-2 pr-3">{e.child_first_name}</td>
                    <td className="py-2 pr-3">{e.child_class}</td>
                    <td className="py-2 pr-3">{e.status}</td>
                    <td className="py-2 pr-3">{new Date(e.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "leads" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3">{l.name}</td>
                    <td className="py-2 pr-3">{l.email}</td>
                    <td className="py-2 pr-3">{l.phone}</td>
                    <td className="py-2 pr-3">{new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
