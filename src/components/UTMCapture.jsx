"use client";

import { useEffect } from "react";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function UTMCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    let hasAny = false;
    UTM_KEYS.forEach((key) => {
      const val = params.get(key);
      if (val) {
        utm[key] = val;
        hasAny = true;
      }
    });
    if (hasAny) {
      try {
        localStorage.setItem("utm_params", JSON.stringify(utm));
      } catch {
        // ignore
      }
    }
  }, []);
  return null;
}

export function getStoredUTM() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("utm_params");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
