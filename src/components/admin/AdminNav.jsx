"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/batches", label: "Courses / Batches" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/leads", label: "Leads CRM" },
  { href: "/admin/orders", label: "Book Orders" },
  { href: "/admin/traffic", label: "Traffic" },
];

export default function AdminNav({ email }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="bg-[var(--color-primary)] text-white">
      <div className="container-wide py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-1 sm:gap-3">
          <span className="font-semibold mr-2">Admin</span>
          {links.map((l) => {
            const active =
              l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-2.5 py-1.5 rounded-lg ${
                  active ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {email && <span className="text-white/70 hidden sm:inline">{email}</span>}
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}