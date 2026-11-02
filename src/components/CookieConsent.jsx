"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cookie-consent-accepted"));
    }
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="container-wide max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm text-[var(--color-body)] flex-1">
          We use cookies for analytics (Google Analytics and Meta Pixel) only after you accept.
          Essential site functionality does not require them.{" "}
          <a href="/privacy" className="underline text-[var(--color-secondary)]">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={reject}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={accept}
            className="btn-primary !py-2 !px-5 text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
