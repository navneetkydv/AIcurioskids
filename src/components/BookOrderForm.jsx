"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Script from "next/script";
import Link from "next/link";
import { bookOrderSchema, INDIAN_STATES } from "@/lib/bookValidations";
import {
  BOOK_TITLE,
  BOOK_PRICE_INR,
  BOOK_OFFER_PRICE_INR,
  BOOK_SAVE_PERCENT,
} from "@/lib/book";
import { getStoredUTM } from "@/components/UTMCapture";
import { trackMetaEvent } from "@/components/Analytics";

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]";

function Field({ id, label, optional, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && (
          <span className="font-normal text-[var(--color-muted)]">
            {" "}
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

export default function BookOrderForm() {
  const [status, setStatus] = useState("idle"); // idle | creating | paying | verifying | error | success
  const [errorMsg, setErrorMsg] = useState("");
  const [summary, setSummary] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookOrderSchema),
    defaultValues: { child_class: "", state: "" },
  });

  const busy =
    status === "creating" || status === "paying" || status === "verifying";

  async function onSubmit(data) {
    setStatus("creating");
    setErrorMsg("");

    try {
      if (!window.Razorpay) {
        setErrorMsg(
          "The payment window could not load. Please refresh and try again.",
        );
        setStatus("error");
        return;
      }

      const res = await fetch("/api/book/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...getStoredUTM() }),
      });
      const json = await res.json();
      if (!res.ok || !json.orderId) {
        setErrorMsg(
          json.error || "Could not start the payment. Please try again.",
        );
        setStatus("error");
        return;
      }

      trackMetaEvent("InitiateCheckout", {
        value: BOOK_OFFER_PRICE_INR,
        currency: "INR",
      });
      setStatus("paying");

      const rzp = new window.Razorpay({
        key: json.keyId,
        amount: json.amount,
        currency: json.currency,
        name: "AIcuriosKids",
        description: `${BOOK_TITLE} book`,
        order_id: json.orderId,
        prefill: {
          name: json.customerName,
          email: json.email,
          contact: json.phone,
        },
        theme: { color: "#1F2A5C" },
        handler: async (response) => {
          setStatus("verifying");
          try {
            const vr = await fetch("/api/book/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                book_order_id: json.bookOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vj = await vr.json();
            if (vr.ok) {
              setSummary({
                orderNo: vj.orderNo,
                email: data.email,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
              });
              setStatus("success");
              trackMetaEvent("Purchase", {
                value: BOOK_OFFER_PRICE_INR,
                currency: "INR",
              });
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              throw new Error("verify failed");
            }
          } catch {
            setErrorMsg(
              `Your payment went through, but we could not confirm it on screen. You will get an email shortly. If not, please contact us with payment ID ${response.razorpay_payment_id}.`,
            );
            setStatus("error");
          }
        },
        modal: {
          ondismiss: () => setStatus((s) => (s === "paying" ? "idle" : s)),
        },
      });
      rzp.open();
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success" && summary) {
    return (
      <div className="card text-center" role="status">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl">Order confirmed!</h2>
        <p className="mb-1">
          Your order number is <strong>{summary.orderNo}</strong>.
        </p>
        <p className="prose-muted mb-6">
          We have sent a confirmation to {summary.email}. Your book will be
          delivered to {summary.city}, {summary.state} - {summary.pincode}.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card space-y-5"
        noValidate
      >
        <input
          type="text"
          {...register("website")}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />


<div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--color-section)] p-2 md:p-4">
  <div className="flex items-center gap-4 min-w-0">
    <img
      src="/cover.jpg"
      alt={`${BOOK_TITLE} cover`}
      width={80}
      height={112}
      loading="lazy"
      className="h-28 w-20 shrink-0 rounded-lg object-cover shadow-md"
    />
    <div className="min-w-0">
      <p className="font-semibold leading-none">{BOOK_TITLE}</p>
      {/* <p className="text-sm text-[var(--color-muted)]">
        FREE Shipping.
      </p> */}
    </div>
  </div>

  <div className="flex shrink-0 flex-col items-end">
    <span className="text-sm text-muted line-through font-normal">
      ₹{BOOK_PRICE_INR.toLocaleString("en-IN")}
    </span>
    <span className="text-2xl font-semibold text-[var(--color-primary)]">
      ₹{BOOK_OFFER_PRICE_INR.toLocaleString("en-IN")}
    </span>
  </div>
</div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="customer_name"
            label="Full name"
            error={errors.customer_name}
          >
            <input
              id="customer_name"
              autoComplete="name"
              className={inputCls}
              {...register("customer_name")}
            />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputCls}
              {...register("email")}
            />
          </Field>
          <Field id="phone" label="Mobile number" error={errors.phone}>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9876543210"
              className={inputCls}
              {...register("phone")}
            />
          </Field>
          <Field
            id="child_class"
            label="Student's class"
            error={errors.child_class}
          >
            <select
              id="child_class"
              className={inputCls}
              {...register("child_class")}
            >
              <option value="">Select class</option>
              {[4, 5, 6, 7, 8, 9].map((c) => (
                <option key={c} value={String(c)}>
                  Class {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="pincode" label="Pincode" error={errors.pincode}>
            <input
              id="pincode"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              className={inputCls}
              {...register("pincode")}
            />
          </Field>
          <Field id="city" label="City" error={errors.city}>
            <input
              id="city"
              autoComplete="address-level2"
              className={inputCls}
              {...register("city")}
            />
          </Field>
          <Field id="state" label="State" error={errors.state}>
            <select
              id="state"
              autoComplete="address-level1"
              className={inputCls}
              {...register("state")}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="address_line1"
          label="Address line 1"
          error={errors.address_line1}
        >
          <input
            id="address_line1"
            autoComplete="address-line1"
            placeholder="House / flat no., building, street"
            className={inputCls}
            {...register("address_line1")}
          />
        </Field>
        <Field
          id="address_line2"
          label="Address line 2"
          optional
          error={errors.address_line2}
        >
          <input
            id="address_line2"
            autoComplete="address-line2"
            placeholder="Area, colony"
            className={inputCls}
            {...register("address_line2")}
          />
        </Field>
        <Field id="landmark" label="Landmark" optional error={errors.landmark}>
          <input
            id="landmark"
            placeholder="Near temple, school, etc."
            className={inputCls}
            {...register("landmark")}
          />
        </Field>

        {errorMsg && (
          <p className="text-sm text-red-600" role="alert">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full disabled:opacity-60"
        >
          {status === "creating"
            ? "Preparing your order…"
            : status === "paying"
              ? "Opening payment…"
              : status === "verifying"
                ? "Confirming payment…"
                : `Pay ₹${BOOK_OFFER_PRICE_INR.toLocaleString("en-IN")} securely`}
        </button>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Secure payment via Razorpay (UPI · Cards · Netbanking).{" "}
          <Link href="/refund" className="underline">
            Refund policy
          </Link>
        </p>
      </form>
    </>
  );
}
