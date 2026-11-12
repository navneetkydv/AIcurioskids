import { NextResponse, after } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isBot, parseUA, parseReferrer, classifySource } from "@/lib/trafficSource";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CLICK_IDS = ["gclid", "fbclid", "msclkid"];

const empty = () => new NextResponse(null, { status: 204 });
const clip = (v, n) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req) {
  // Browsers only: same-origin requests (curl sends no header, which is fine)
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return empty();

  const ua = req.headers.get("user-agent") || "";
  if (isBot(ua)) return empty();

  let body;
  try {
    const text = await req.text();
    if (text.length > 4000) return empty();
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { session_id, visitor_id } = body || {};
  let path = typeof body?.path === "string" ? body.path.split("?")[0].slice(0, 200) : "";
  if (!UUID_RE.test(session_id) || !UUID_RE.test(visitor_id)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!path.startsWith("/") || path.startsWith("//")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (path.startsWith("/admin") || path.startsWith("/api")) return empty();

  const c = body.ctx && typeof body.ctx === "object" ? body.ctx : {};
  const clickIdType = CLICK_IDS.includes(c.click_id_type) ? c.click_id_type : null;
  const ref = parseReferrer(clip(c.referrer, 500), req.headers.get("host"));
  const utmSource = clip(c.utm_source, 100);
  const utmMedium = clip(c.utm_medium, 100);
  const { source, medium } = classifySource({
    utmSource,
    utmMedium,
    clickIdType,
    referrerHost: ref.host,
  });
  const { device, browser, os } = parseUA(ua);

  const landing = clip(c.landing_path, 200);
  const ctx = {
    landing_path: landing && landing.startsWith("/") ? landing.split("?")[0] : path,
    is_returning: c.is_returning === true,
    referrer_host: ref.host,
    referrer_url: ref.url,
    source,
    medium,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: clip(c.utm_campaign, 150),
    utm_content: clip(c.utm_content, 150),
    utm_term: clip(c.utm_term, 150),
    click_id_type: clickIdType,
    device,
    browser,
    os,
    // Coarse location from Vercel's edge headers (empty on localhost)
    country: clip(req.headers.get("x-vercel-ip-country"), 10),
    region: clip(req.headers.get("x-vercel-ip-country-region"), 10),
  };

  // Answer immediately; save afterwards
  after(async () => {
    const { error } = await getServiceSupabase().rpc("track_visit", {
      p_session_id: session_id,
      p_visitor_id: visitor_id,
      p_path: path,
      p_ctx: ctx,
    });
    if (error) console.error("track_visit failed:", error.message);
  });

  return empty();
}