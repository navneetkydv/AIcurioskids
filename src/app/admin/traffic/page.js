"use client";

import { useEffect, useState } from "react";

const RANGES = [
  { days: 1, label: "24 hours" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const nf = (n) => Number(n || 0).toLocaleString("en-IN");

function Kpi({ label, value, hint }) {
  return (
    <div className="card !p-4">
      <p className="text-sm text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--color-primary)]">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}

function Panel({ title, note, children }) {
  return (
    <section className="card">
      <h2 className="mb-1 text-lg">{title}</h2>
      {note && <p className="mb-3 text-xs text-[var(--color-muted)]">{note}</p>}
      {children}
    </section>
  );
}

function Table({ rows, columns }) {
  if (!rows?.length) {
    return <p className="py-4 text-sm text-[var(--color-muted)]">No data yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-section)] text-[var(--color-muted)]">
            {columns.map((c) => (
              <th key={c.label} className={`py-2 pr-4 font-medium ${c.right ? "text-right" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[var(--color-section)] last:border-0">
              {columns.map((c) => (
                <td key={c.label} className={`py-2 pr-4 ${c.right ? "text-right tabular-nums" : "break-all"}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailyChart({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.sessions));
  return (
    <div>
      <div className="flex h-40 items-end gap-[2px]" role="img" aria-label="Sessions per day">
        {rows.map((r) => (
          <div key={r.day} className="flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-[var(--color-secondary)]"
              style={{ height: `${(r.sessions / max) * 100}%`, minHeight: r.sessions ? 2 : 0 }}
              title={`${r.day}: ${r.sessions} sessions, ${r.visitors} visitors`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-[var(--color-muted)]">
        <span>{rows[0]?.day}</span>
        <span>{rows[rows.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export default function AdminTrafficPage() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Failed to load analytics");
          return;
        }
        setSummary(json.summary);
      } catch {
        if (!cancelled) setError("Failed to load analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const t = summary?.totals;
  const returningPct = t?.sessions ? Math.round((t.returning_sessions / t.sessions) * 100) : 0;

  return (
    <main className="container-wide py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-3xl">Website traffic</h1>
        <div className="flex gap-2" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              role="tab"
              aria-selected={days === r.days}
              onClick={() => setDays(r.days)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                days === r.days
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
      {loading && <p className="mb-4 text-sm text-[var(--color-muted)]">Loading…</p>}

      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Visitors" value={nf(t.visitors)} hint="Unique browsers" />
            <Kpi label="Sessions" value={nf(t.sessions)} />
            <Kpi label="Page views" value={nf(t.pageviews)} />
            <Kpi label="Returning" value={`${returningPct}%`} hint="Of sessions" />
          </div>

          <Panel title="Sessions per day" note="Days are in Indian time.">
            <DailyChart rows={summary.daily || []} />
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Traffic sources" note="Where visitors came from (UTM tags first, then referrer).">
              <Table
                rows={summary.by_source}
                columns={[
                  { label: "Source / medium", render: (r) => `${r.source} / ${r.medium}` },
                  { label: "Sessions", key: "sessions", right: true, render: (r) => nf(r.sessions) },
                  { label: "Visitors", key: "visitors", right: true, render: (r) => nf(r.visitors) },
                ]}
              />
            </Panel>

            <Panel title="Campaigns" note="Visits that came with a utm_campaign tag.">
              <Table
                rows={summary.by_campaign}
                columns={[
                  { label: "Campaign", key: "campaign" },
                  { label: "Source / medium", render: (r) => `${r.utm_source || "—"} / ${r.utm_medium || "—"}` },
                  { label: "Sessions", right: true, render: (r) => nf(r.sessions) },
                ]}
              />
            </Panel>

            <Panel title="Paid book orders by UTM source" note="Orders only carry a source when the visitor arrived through a UTM-tagged link.">
              <Table
                rows={summary.orders_by_utm_source}
                columns={[
                  { label: "UTM source", key: "source" },
                  { label: "Orders", right: true, render: (r) => nf(r.orders) },
                  { label: "Revenue", right: true, render: (r) => `₹${nf(r.revenue)}` },
                ]}
              />
            </Panel>

            <Panel title="Referring sites">
              <Table
                rows={summary.referrers}
                columns={[
                  { label: "Site", key: "host" },
                  { label: "Sessions", right: true, render: (r) => nf(r.sessions) },
                ]}
              />
            </Panel>

            <Panel title="Landing pages" note="The first page of each session.">
              <Table
                rows={summary.landing_pages}
                columns={[
                  { label: "Page", key: "path" },
                  { label: "Sessions", right: true, render: (r) => nf(r.sessions) },
                ]}
              />
            </Panel>

            <Panel title="Most viewed pages">
              <Table
                rows={summary.top_pages}
                columns={[
                  { label: "Page", key: "path" },
                  { label: "Views", right: true, render: (r) => nf(r.views) },
                ]}
              />
            </Panel>

            <Panel title="Devices">
              <Table
                rows={summary.devices}
                columns={[
                  { label: "Device", key: "device" },
                  { label: "Sessions", right: true, render: (r) => nf(r.sessions) },
                ]}
              />
            </Panel>

            <Panel title="Browsers" note="Includes in-app browsers such as Instagram and Facebook.">
              <Table
                rows={summary.browsers}
                columns={[
                  { label: "Browser", key: "browser" },
                  { label: "Sessions", right: true, render: (r) => nf(r.sessions) },
                ]}
              />
            </Panel>

            <Panel title="Locations" note="Country and state code, from the connection (approximate).">
              <Table
                rows={summary.locations}
                columns={[
                  { label: "Location", render: (r) => `${r.country}${r.region ? ` · ${r.region}` : ""}` },
                  { label: "Sessions", right: true, render: (r) => nf(r.sessions) },
                ]}
              />
            </Panel>
          </div>
        </div>
      )}
    </main>
  );
}