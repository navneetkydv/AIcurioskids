"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const me = await fetch("/api/admin/auth/me");
      if (!me.ok) {
        router.replace("/admin/login");
        return;
      }
      const meData = await me.json();
      setEmail(meData.email || "");

      const res = await fetch("/api/admin/data");
      if (!res.ok) {
        setError("Could not load stats");
        return;
      }
      const data = await res.json();
      setStats(data.stats);
    }
    init();
  }, [router]);

  if (!stats && !error) {
    return (
      <div className="p-8 text-center text-muted">Loading…</div>
    );
  }

  const cards = [
    { label: "Confirmed enrollments", value: stats?.confirmed ?? "—", href: "/admin/enrollments?status=confirmed" },
    { label: "Pending payments", value: stats?.pending ?? "—", href: "/admin/enrollments?status=pending" },
    { label: "Total leads", value: stats?.totalLeads ?? "—", href: "/admin/leads" },
    { label: "Open batches", value: stats?.openBatches ?? "—", href: "/admin/batches" },
  ];

  return (
    <>
      <AdminNav email={email} />
      <div className="container-wide py-8">
        <h1 className="text-2xl font-semibold text-primary mb-6">Dashboard</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="card hover:shadow-md transition-shadow">
              <p className="text-sm text-muted">{c.label}</p>
              <p className="text-3xl font-semibold text-primary mt-1">{c.value}</p>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/batches" className="btn-primary">
            Create / manage courses
          </Link>
          <Link href="/admin/leads" className="btn-secondary">
            Open leads CRM
          </Link>
        </div>
      </div>
    </>
  );
}
