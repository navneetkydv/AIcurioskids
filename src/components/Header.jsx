"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/course", label: "The Course" },
  { href: "/book", label: "The Book" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-[var(--color-primary)] text-white shadow-md"
        style={{ position: "sticky", top: 0, zIndex: 50 }}
      >
        <div
          className="container-wide flex items-center justify-between"
          style={{ height: 64, minHeight: 64 }}
        >
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight"
            style={{ position: "relative", zIndex: 60 }}
            onClick={() => setOpen(false)}
          >
            AIcuriosKids
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-opacity hover:opacity-90 ${
                  pathname === link.href
                    ? "opacity-100 underline underline-offset-4"
                    : "opacity-85"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/enroll" className="btn-primary text-sm !py-2.5 !px-5">
              Enroll Now
            </Link>
          </nav>

          {/* Mobile button — always visible under md */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center"
            style={{
              position: "relative",
              zIndex: 60,
              width: 48,
              height: 48,
              marginRight: -8,
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/*
        Mobile menu OUTSIDE sticky header so it is never clipped.
        Fixed full-width panel below the 64px header bar.
        Only shown on small screens via CSS media query + open state.
      */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 55,
            backgroundColor: "rgba(28, 32, 51, 0.45)",
          }}
          onClick={() => setOpen(false)}
        >
          <nav
            style={{
              backgroundColor: "#1F2A5C",
              color: "white",
              padding: "16px 20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "block",
                  padding: "14px 8px",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "white",
                  textDecoration: "none",
                  borderRadius: 8,
                }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/enroll"
              className="btn-primary"
              style={{ marginTop: 12, textAlign: "center" }}
              onClick={() => setOpen(false)}
            >
              Enroll Now
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}