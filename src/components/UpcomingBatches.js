"use client";

import { useEffect, useState } from "react";
import { getStoredUTM } from "@/components/UTMCapture";

/** Group flat schedule_sessions into week blocks for accordion UI */
function groupSessionsByWeek(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return [];
  const groups = [];
  let current = null;

  for (const row of sessions) {
    if (row.isWeekHeader) {
      current = { week: row.week || "Week", sessions: [] };
      groups.push(current);
    } else {
      if (!current) {
        current = { week: "Schedule", sessions: [] };
        groups.push(current);
      }
      current.sessions.push(row);
    }
  }
  return groups;
}

export default function UpcomingBatches() {
  const [batches, setBatches] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openWeek, setOpenWeek] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/batches");
        const data = await res.json();
        const list = data.batches || [];
        setBatches(list);
        if (list.length) setActiveId(list[0].id);
      } catch {
        setBatches([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Reset open week when batch changes
  useEffect(() => {
    setOpenWeek(0);
  }, [activeId]);

  const active = batches.find((b) => b.id === activeId) || batches[0];
  const weekGroups = groupSessionsByWeek(active?.schedule_sessions || []);

  function toggleWeek(index) {
    setOpenWeek((prev) => (prev === index ? -1 : index));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const utm = getStoredUTM();
      const res = await fetch("/api/leads/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, ...utm, website: "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setStatus("error");
        return;
      }
      const a = document.createElement("a");
      a.href = data.downloadUrl || "/brochure.pdf";
      a.download = "AI-Course-Brochure.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus("success");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setName("");
        setEmail("");
        setPhone("");
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="py-14 md:py-20 section-tint">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl text-[var(--color-primary)]">
              Explore Upcoming Batches
            </h2>
            <p className="text-[var(--color-muted)] mt-2 text-sm md:text-base">
              Live classes · Morning and/or evening slots (IST)
            </p>
          </div>
          <button type="button" onClick={() => setOpen(true)} className="btn-primary shrink-0">
            Download Brochure
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--color-muted)]">Loading batches…</p>
        ) : batches.length === 0 ? (
          <div className="card text-sm text-[var(--color-muted)]">
            No open batches yet. Check back soon or{" "}
            <a href="/contact" className="underline text-[var(--color-secondary)]">
              contact us
            </a>
            .
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {batches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveId(b.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeId === b.id
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-white text-[var(--color-primary)] border border-gray-200 hover:border-[var(--color-secondary)]"
                  }`}
                >
                  {b.label || b.short_label || b.name}
                </button>
              ))}
            </div>

            <div className="card">
              <p className="font-semibold text-[var(--color-primary)] mb-1">
                {active?.label || active?.short_label || active?.name}
              </p>
              {active?.schedule_text && (
                <p className="text-sm text-[var(--color-muted)] mb-2">{active.schedule_text}</p>
              )}
              {active?.price_inr != null && (
                <p className="text-sm mb-4 flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-[var(--color-primary)] text-lg">
                    ₹{Number(active.price_inr).toLocaleString("en-IN")}
                  </span>
                  {active.display_price_inr &&
                  active.display_price_inr > active.price_inr ? (
                    <span className="text-[var(--color-muted)] line-through">
                      ₹{Number(active.display_price_inr).toLocaleString("en-IN")}
                    </span>
                  ) : null}
                  <a href="/enroll" className="text-[var(--color-secondary)] underline text-sm ml-1">
                    Enroll
                  </a>
                </p>
              )}

              {weekGroups.length === 0 ? (
                <p className="text-[var(--color-muted)] text-sm py-4">
                  Full timetable will be published soon.
                  {active?.start_date && (
                    <>
                      {" "}
                      Starts <strong>{active.start_date}</strong>
                      {active.end_date ? ` → ${active.end_date}` : ""}.
                    </>
                  )}
                </p>
              ) : (
                <>
                  {/* Mobile: accordion by week */}
                  <div className="md:hidden space-y-2">
                    {weekGroups.map((group, index) => {
                      const isOpen = openWeek === index;
                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-gray-200 overflow-hidden bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleWeek(index)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-[var(--color-primary)] bg-[var(--color-section)]"
                            aria-expanded={isOpen}
                          >
                            <span>{group.week}</span>
                            <span
                              className="text-lg leading-none transition-transform"
                              style={{
                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                              aria-hidden
                            >
                              ▾
                            </span>
                          </button>
                          {isOpen && (
                            <div className="px-4 py-3 space-y-3">
                              {group.sessions.map((row, j) => (
                                <div
                                  key={j}
                                  className="border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                                >
                                  <p className="text-sm font-medium text-[var(--color-body)] mb-2">
                                    {row.day}
                                  </p>
                                  <div className="grid grid-cols-1 gap-1.5 text-sm">
                                    {row.morning && (
                                      <p className="text-[var(--color-muted)]">
                                        <span className="font-medium text-[var(--color-primary)]">
                                          Morning:{" "}
                                        </span>
                                        {row.morning}
                                      </p>
                                    )}
                                    {row.evening && (
                                      <p className="text-[var(--color-muted)]">
                                        <span className="font-medium text-[var(--color-primary)]">
                                          Evening:{" "}
                                        </span>
                                        {row.evening}
                                      </p>
                                    )}
                                    {!row.morning && !row.evening && (
                                      <p className="text-[var(--color-muted)]">Timings TBA</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {group.sessions.length === 0 && (
                                <p className="text-sm text-[var(--color-muted)]">No sessions yet</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[640px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 pr-4 font-semibold text-[var(--color-muted)]">
                            Day &amp; Date
                          </th>
                          <th className="py-3 pr-4 font-semibold text-[var(--color-muted)]">
                            Morning (IST)
                          </th>
                          <th className="py-3 font-semibold text-[var(--color-muted)]">
                            Evening (IST)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(active?.schedule_sessions || []).map((row, i) =>
                          row.isWeekHeader ? (
                            <tr key={`w-${i}`} className="bg-[var(--color-section)]">
                              <td
                                colSpan={3}
                                className="py-2 px-2 font-semibold text-[var(--color-primary)]"
                              >
                                {row.week}
                              </td>
                            </tr>
                          ) : (
                            <tr key={`s-${i}`} className="border-b border-gray-100">
                              <td className="py-3 pr-4">{row.day}</td>
                              <td className="py-3 pr-4">
                                {row.morning || (
                                  <span className="text-[var(--color-muted)]">—</span>
                                )}
                              </td>
                              <td className="py-3">
                                {row.evening || (
                                  <span className="text-[var(--color-muted)]">—</span>
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(28, 32, 51, 0.5)" }}
          onClick={() => status !== "loading" && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-1">
              Download brochure
            </h3>
            <p className="text-sm text-[var(--color-muted)] mb-5">
              Share your details and we&apos;ll start the download.
            </p>
            {status === "success" ? (
              <p className="text-[var(--color-success)] font-medium py-4">
                Thank you! Your download should start automatically.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile (+91)</label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setOpen(false)}
                    disabled={status === "loading"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Please wait…" : "Download"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}