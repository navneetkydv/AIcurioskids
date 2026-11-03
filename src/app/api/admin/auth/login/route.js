import { NextResponse } from "next/server";
import {
  checkAdminPassword,
  isAllowedAdminEmail,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }
    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (email && !isAllowedAdminEmail(email)) {
      return NextResponse.json({ error: "Email not allowed" }, { status: 403 });
    }

    await setAdminSessionCookie(email || process.env.ADMIN_EMAIL || "admin");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
