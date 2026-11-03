import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_API_SECRET must be set (min 16 chars)");
  }
  return secret;
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) return null;
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAdminToken(email) {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  return sign({ role: "admin", email: email || "admin", exp });
}

export async function setAdminSessionCookie(email) {
  const token = createAdminToken(email);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearAdminSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    return verify(token);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, session: null };
  }
  return { ok: true, session };
}

/** Password check: ADMIN_PASSWORD or fallback ADMIN_API_SECRET */
export function checkAdminPassword(password) {
  const expected =
    process.env.ADMIN_PASSWORD || process.env.ADMIN_API_SECRET || "";
  if (!expected || !password) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function isAllowedAdminEmail(email) {
  const allow = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return true; // password-only mode
  return allow.includes(String(email || "").toLowerCase());
}