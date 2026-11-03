import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";

function verifyToken(token, secret) {
  if (!token || !secret) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [body, sig] = parts;

    const expected = createHmac("sha256", secret).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.role !== "admin") return false;
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_API_SECRET || process.env.ADMIN_PASSWORD || "";

  if (!verifyToken(token, secret)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export { proxy };
export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};