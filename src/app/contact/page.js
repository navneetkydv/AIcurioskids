"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema } from "@/lib/validations";
import { getStoredUTM } from "@/components/UTMCapture";

export default function ContactPage() {
  const [status, setStatus] = useState("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(leadSchema),
  });

  async function onSubmit(data) {
    setStatus("loading");
    try {
      const utm = getStoredUTM();
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...utm }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";

  return (
    <>
      <section className="bg-[var(--color-primary)] text-white py-14">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Contact</h1>
          <p className="text-white/80 mt-2">We usually reply within one business day.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container-wide max-w-lg">
          {status === "success" ? (
            <div className="card text-center">
              <p className="text-[var(--color-success)] font-semibold mb-2">Message sent</p>
              <p className="prose-muted">Thank you. We will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
              <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" />

              <div>
                <label className="block text-sm font-medium mb-1.5">Your name</label>
                <input
                  {...register("name")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone (+91)</label>
                <input
                  {...register("phone")}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message (optional)</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                />
              </div>
              {status === "error" && (
                <p className="text-red-600 text-sm">Something went wrong. Please try again or use WhatsApp.</p>
              )}
              <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
                {status === "loading" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}

          <div className="mt-10 text-center text-sm prose-muted">
            <p>
              Prefer WhatsApp?{" "}
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                className="text-[var(--color-secondary)] font-medium underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat with us
              </a>
            </p>
            <p className="mt-2">
              Email: <a href="mailto:hello@aicurioskids.in" className="underline">hello@aicurioskids.in</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
