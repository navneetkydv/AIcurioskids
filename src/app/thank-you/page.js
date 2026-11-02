import Link from "next/link";

export const metadata = {
  title: "Enrollment confirmed",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <section className="py-20">
      <div className="container-wide max-w-lg text-center">
        <div className="text-4xl mb-4 text-[var(--color-success)]">✓</div>
        <h1 className="text-3xl font-semibold mb-4">You&apos;re enrolled!</h1>
        <p className="prose-muted mb-6">
          Thank you. We have sent a confirmation email with batch details.
          The next batch starts on <strong>[batch start date]</strong>.
        </p>
        <p className="prose-muted mb-8">
          Join the parent WhatsApp group for updates:{" "}
          <a href="[WhatsApp group link]" className="text-[var(--color-secondary)] underline">
            [WhatsApp group link]
          </a>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
          <a
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "")}`}
            className="btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
