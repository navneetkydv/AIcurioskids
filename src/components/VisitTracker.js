"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VID_KEY = "aik_vid";
const SESSION_KEY = "aik_session";
const OPT_OUT_KEY = "aik_no_track";
const SESSION_MS = 30 * 60 * 1000;

function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  // randomUUID needs https; this also works over http (e.g. testing on a phone via LAN IP)
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode): tracking still works per page load */
  }
}

function getVisitor() {
  try {
    const id = localStorage.getItem(VID_KEY);
    if (id && /^[0-9a-f-]{36}$/i.test(id)) return { id, isNew: false };
  } catch {}
  const id = uuid();
  try {
    localStorage.setItem(VID_KEY, id);
  } catch {}
  return { id, isNew: true };
}

function marketingParams() {
  const p = new URLSearchParams(window.location.search);
  const get = (k, n = 100) => (p.get(k) || "").slice(0, n) || null;
  return {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign", 150),
    utm_content: get("utm_content", 150),
    utm_term: get("utm_term", 150),
    click_id_type: p.get("gclid") ? "gclid" : p.get("msclkid") ? "msclkid" : p.get("fbclid") ? "fbclid" : null,
  };
}

const hasMarketing = (m) => !!(m.utm_source || m.utm_campaign || m.click_id_type);
const campaignKey = (m) => [m.utm_source, m.utm_medium, m.utm_campaign, m.click_id_type].join("|");

function resolveSession(pathname, visitor) {
  const now = Date.now();
  const m = marketingParams();
  let s = readJSON(SESSION_KEY);

  const expired = !s || !s.id || now - (s.ts || 0) > SESSION_MS;
  const newCampaign = !expired && hasMarketing(m) && campaignKey(m) !== campaignKey(s.ctx || {});

  if (expired || newCampaign) {
    s = {
      id: uuid(),
      ts: now,
      ctx: {
        ...m,
        referrer: document.referrer || null,
        landing_path: pathname,
        is_returning: !visitor.isNew,
      },
    };
  } else {
    s.ts = now;
  }
  writeJSON(SESSION_KEY, s);
  return s;
}

export default function VisitTracker() {
  const pathname = usePathname();
  const last = useRef(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (last.current === pathname) return; // avoids double counts in dev Strict Mode
    last.current = pathname;

    try {
      if (localStorage.getItem(OPT_OUT_KEY)) return; // your own devices
    } catch {}
    if (
      navigator.doNotTrack === "1" ||
      navigator.doNotTrack === "yes" ||
      navigator.globalPrivacyControl
    ) {
      return;
    }

    const visitor = getVisitor();
    const session = resolveSession(pathname, visitor);

    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session.id,
        visitor_id: visitor.id,
        path: pathname,
        ctx: session.ctx,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}