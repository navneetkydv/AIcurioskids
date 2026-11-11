import BookOrderForm from "@/components/BookOrderForm";
import { Truck, PackageCheck, ShieldCheck,MapPin } from "lucide-react";
import {
  BOOK_TITLE,
  BOOK_PRICE_INR,
  BOOK_OFFER_PRICE_INR,
  BOOK_SAVE_PERCENT,
} from "@/lib/book";


export const metadata = {
  title: "Order the Book",
  description:
    "Order the “AI for Students” workbook and get it delivered to your home.",
};

export default function BookOrderPage() {
  return (
    <>
      <section className="bg-[var(--color-primary)] py-12 text-white">
        <div className="container-wide">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Order the Book
          </h1>
          <p className="mt-2 text-white/80">
            Delivered to your home. Secure online payment.
          </p>

          {/* Offer badge */}
          <div className="mt-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
              {BOOK_SAVE_PERCENT}% OFF
            </span>
            <span>
              <span className="text-white/70 line-through">
                ₹{BOOK_PRICE_INR.toLocaleString("en-IN")}
              </span>{" "}
              <span className="font-semibold">
                ₹{BOOK_OFFER_PRICE_INR.toLocaleString("en-IN")}
              </span>
            </span>
          </div>

          {/* Delivery / trust details */}
          <ul className="mt-5 flex flex-col gap-2 text-sm text-white/90 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0" aria-hidden />
              <span>FREE shipping</span>
            </li>
            <li className="flex items-center gap-2">
    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
    <span>Pan-India delivery</span>
  </li>
            <li className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 shrink-0" aria-hidden />
              <span>Delivery in 4-5 days</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
              <span>Secure online payment</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="mx-auto w-full max-w-2xl px-4">
          <BookOrderForm />
        </div>
      </section>
    </>
  );
}
