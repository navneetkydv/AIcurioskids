"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enrollSchema, CONSENT_TEXT } from "@/lib/validations";
import { getStoredUTM } from "@/components/UTMCapture";
import Link from "next/link";
import Script from "next/script";

export default function EnrollPage() {
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      consent: undefined,
      terms: undefined,
    },
  });

  const selectedBatchId = watch("batch_id");
  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/batches");
        if (res.ok) {
          const data = await res.json();
          setBatches(data.batches || []);
        }
      } catch {
        // fallback empty
      } finally {
        setLoadingBatches(false);
      }
    }
    load();
  }, []);

  async function onSubmit(data) {
    setStatus("creating");
    setErrorMsg("");
    try {
      const utm = getStoredUTM();
      const res = await fetch("/api/enroll/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...utm }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Could not create order");
        setStatus("error");
        return;
      }

      setStatus("paying");
      const options = {
        key: json.keyId,
        amount: json.amount,
        currency: json.currency,
        name: "[Brand Name]",
        description: `AI Course – ${json.batchName}`,
        order_id: json.orderId,
        prefill: {
          name: json.parentName,
          email: json.parentEmail,
          contact: json.parentPhone,
        },
        theme: { color: "#1F2A5C" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/enroll/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                enrollment_id: json.enrollmentId,
              }),
            });
            if (verifyRes.ok) {
              window.location.href = "/thank-you";
            } else {
              setErrorMsg("Payment received but verification failed. Contact us with your payment ID.");
              setStatus("error");
            }
          } catch {
            setErrorMsg("Verification error. Contact support with your payment ID.");
            setStatus("error");
          }
        },
        modal: {
          ondismiss: function () {
            setStatus("idle");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <section className="bg-[var(--color-primary)] text-white py-12">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Enroll in the Live Course</h1>
          <p className="text-white/80 mt-2">Secure your child&apos;s seat. Complete workbook included free.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-wide max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
            <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" />

            <div>
              <label className="block text-sm font-medium mb-1.5">Parent / guardian full name</label>
              <input
                {...register("parent_name")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              />
              {errors.parent_name && <p className="text-red-600 text-sm mt-1">{errors.parent_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Parent email</label>
              <input
                type="email"
                {...register("parent_email")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              />
              {errors.parent_email && <p className="text-red-600 text-sm mt-1">{errors.parent_email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Parent phone (+91)</label>
              <input
                {...register("parent_phone")}
                placeholder="9876543210"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              />
              {errors.parent_phone && <p className="text-red-600 text-sm mt-1">{errors.parent_phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Child&apos;s first name only</label>
              <input
                {...register("child_first_name")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              />
              {errors.child_first_name && (
                <p className="text-red-600 text-sm mt-1">{errors.child_first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Child&apos;s class</label>
              <select
                {...register("child_class")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              >
                <option value="">Select class</option>
                <option value="5">Class 5</option>
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
              </select>
              {errors.child_class && <p className="text-red-600 text-sm mt-1">{errors.child_class.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              <input
                {...register("city")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              />
              {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Select batch</label>
              {loadingBatches ? (
                <p className="text-sm text-[var(--color-muted)]">Loading batches…</p>
              ) : batches.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  No open batches right now.{" "}
                  <Link href="/contact" className="underline">
                    Contact us
                  </Link>{" "}
                  to join the waitlist.
                </p>
              ) : (
                <select
                  {...register("batch_id")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                >
                  <option value="">Choose a batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.short_label || b.name} · starts {b.start_date}
                      {b.seats_left !== null ? ` · ${b.seats_left} seats left` : ""} · ₹{b.price_inr}
                    </option>
                  ))}
                </select>
              )}
              {errors.batch_id && <p className="text-red-600 text-sm mt-1">{errors.batch_id.message}</p>}

              {selectedBatch && (
                <div className="mt-4 rounded-2xl border border-[var(--color-section)] bg-[var(--color-section)]/60 p-4">
                  <p className="text-sm text-[var(--color-muted)] mb-1">You will pay</p>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl font-semibold text-[var(--color-primary)]">
                      ₹{selectedBatch.price_inr.toLocaleString("en-IN")}
                    </span>
                    {selectedBatch.display_price_inr &&
                    selectedBatch.display_price_inr > selectedBatch.price_inr ? (
                      <>
                        <span className="text-base text-[var(--color-muted)] line-through">
                          ₹{selectedBatch.display_price_inr.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-medium text-[var(--color-success)] bg-white/80 px-2 py-0.5 rounded-full">
                          Save ₹
                          {(
                            selectedBatch.display_price_inr - selectedBatch.price_inr
                          ).toLocaleString("en-IN")}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-2">
                    Book included free · Secure payment via Razorpay (UPI / cards / netbanking)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex gap-3 items-start text-sm cursor-pointer">
                <input type="checkbox" {...register("consent")} className="mt-1 rounded" />
                <span>{CONSENT_TEXT}</span>
              </label>
              {errors.consent && <p className="text-red-600 text-sm">{errors.consent.message}</p>}

              <label className="flex gap-3 items-start text-sm cursor-pointer">
                <input type="checkbox" {...register("terms")} className="mt-1 rounded" />
                <span>
                  I accept the{" "}
                  <Link href="/terms" className="underline" target="_blank">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/refund" className="underline" target="_blank">
                    Refund Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && <p className="text-red-600 text-sm">{errors.terms.message}</p>}
            </div>

            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === "creating" || status === "paying" || batches.length === 0}
                className="btn-primary w-full"
              >
                {status === "creating"
                  ? "Creating order…"
                  : status === "paying"
                    ? "Opening payment…"
                    : "Proceed to secure payment"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--color-muted)] pt-2">
              <span className="flex items-center gap-1">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="8" height="7" rx="1" />
                  <path d="M5 6V4a2 2 0 014 0v2" />
                </svg>
                Secure payment via Razorpay
              </span>
              <span>UPI · Cards · Netbanking</span>
              <Link href="/refund" className="underline">
                Refund policy
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}