import Link from "next/link";
import Image from "next/image";
import UpcomingBatches from "@/components/UpcomingBatches";
import BookShowcase from "@/components/BookShowcase";
import DownloadBrochureButton from "@/components/DownloadBrochureButton";
import Mentors from "@/components/Mentors";
import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/QuickAns";
export const metadata = {
  title: "Home",
  description:
    "Your child already uses AI. Do they know when it's wrong? A 4-week live online AI classes for Class 4-9 students. Complete book included free.",
};

const trustItems = [
  "Live classes",
  "No coding required",
  "40+ hands-on activities",
  "4 weeks program",
  "Designed by engineering graduates",
];

const problemPoints = [
  {
    title: "They copy answers without understanding them",
    body: "AI can write homework in seconds. Without guidance, children stop thinking for themselves.",
  },
  {
    title: "They don't know what is safe to share",
    body: "Personal details, photos, and school information can end up in the wrong places.",
  },
  {
    title: "Many schools are still catching up",
    body: "The tools changed overnight. Most classrooms have not yet taught how to use them wisely.",
  },
];

const overviewCards = [
  {
    title: "Live classes",
    body: "Interactive sessions with real teachers who explain AI in language Class 5–8 students understand.",
    icon: "🎥",
  },
  {
    title: "Hands-on workbook",
    body: "Complete “AI for Students” book free with enrollment — 8 chapters, 40+ activities.",
    icon: "📘",
  },
  {
    title: "Safe and responsible",
    body: "Privacy, wrong answers, and when not to trust AI — skills every child needs now.",
    icon: "🛡️",
  },
];

const weeks = [
  {
    week: 1,
    title: "Meet AI",
    desc: "What AI is, daily-life examples, how it learns.",
  },
  {
    week: 2,
    title: "Talk to AI",
    desc: "Better questions, clear prompts, getting useful answers.",
  },
  {
    week: 3,
    title: "Create and learn",
    desc: "Understanding concepts, generating ideas, mini projects.",
  },
  {
    week: 4,
    title: "Stay safe, think ahead",
    desc: "Privacy, wrong answers, responsible use, future opportunities.",
  },
];

const worldOfWorkStats = [
  {
    value: "40%",
    label: "of jobs worldwide",
    body: "could be affected by AI, as per IMF estimates — transforming how people work and highlighting the need for continuous upskilling.",
  },
  {
    value: "170M",
    label: "new jobs globally",
    body: "are expected to be created by AI by 2030. Staying up to date with AI advances will matter for the next generation.",
  },
  {
    value: "300M",
    label: "jobs exposed to automation",
    body: "globally, as per Goldman Sachs. Understanding AI — not just using it — becomes highly relevant in this scenario.",
  },
];

const PRICE_ORIGINAL = process.env.NEXT_PUBLIC_PRICE_ORIGINAL_HOME || 10000;
const PRICE_OFFER = process.env.NEXT_PUBLIC_PRICE_OFFER_HOME   || 4500;
const SAVE_PERCENT = Math.round((1 - PRICE_OFFER / PRICE_ORIGINAL) * 100);
const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function HomePage() {
  return (
    <>
      <section className="relative bg-[var(--color-primary)] text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute  -left-24 md:top-8 top-30 h-72 w-72 rounded-full bg-[var(--color-accent)]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-secondary/30 blur-3xl"
        />

        <div className="container-wide py-12 md:py-20">
          {/* grid */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            {/* Text */}
            <div className="order-2 md:order-1">
              <h1 className="text-2xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-5">
                Your child already uses AI.
                <br />
                Do they know when it&apos;s wrong?
              </h1>
              <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed">
                A 4-week live online classes that change how your child sees and
                uses AI. <br></br> They learn how AI works, how to ask better
                questions, and how to use it safely.{" "}
                <span className="italic">(for Class 4–9)</span>
                <br></br>
                {/* <span className="font-semibold text-white">
                  FREE book included.
                </span> */}
              </p>
              <div className="mb-8">
                <div className="glass-card w-full max-w-md p-5 sm:p-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    Early bird offer
                  </span>

                  <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                    <p className="text-4xl font-semibold leading-none tracking-tight sm:text-5xl">
                      <span className="sr-only">Offer price </span>
                      {formatINR(PRICE_OFFER)}
                    </p>
                    <p className="pb-1 text-lg text-white/60 sm:text-xl">
                      <span className="sr-only">Original price </span>
                      <s>{formatINR(PRICE_ORIGINAL)}</s>
                    </p>
                    <p className="pb-1 text-sm font-medium text-[var(--color-accent)]">
                      Save {SAVE_PERCENT}%
                    </p>
                  </div>

                  <Link
                    href="/enroll"
                    className="btn-primary mt-5 w-full text-center leading-snug"
                  >
                    Book your child&apos;s seat now
                  </Link>

                  <p className="mt-3 flex items-center justify-center gap-2 text-sm text-white/80">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
                      <path d="M3 8l9 5 9-5M12 13v8" />
                    </svg>
                    Book delivered FREE at home
                  </p>
                </div>

                <DownloadBrochureButton
                  label="Download brochure"
                  className="mt-4 inline-block text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
                />
                <Link
                    href="/book"
                    className="mt-4 inline-block text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white ml-4"
                  >
                    Discover the book
                  </Link>
              </div>
              <ul className="flex flex-wrap gap-2.5">
                {trustItems.map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hero image */}
            <div className="order-1 md:order-2 relative">
              <div className="relative aspect-[4/3] md:aspect-square max-w-md mx-auto md:max-w-none rounded-2xl overflow-hidden shadow-soft bg-white/10 border border-white/15">
                <Image
                  src="/hero.png"
                  alt="Children learning AI — Class 5 to 8 students exploring technology together"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* Soft decorative accent */}
              <div
                className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-[var(--color-accent)]/20 blur-2xl"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>

      {/* World of work — AI job stats (light background) */}
      <section className="relative py-14 md:py-20 bg-[var(--color-bg)]">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl text-center text-[var(--color-primary)] mb-3">
            The world of work is being rewritten by AI
          </h2>
          <p className="text-center text-[var(--color-muted)] mb-12 max-w-2xl mx-auto">
            Today&apos;s Class 4-9 students will enter a job market shaped by
            AI. Understanding it early is not optional — it is preparation.
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {worldOfWorkStats.map((s) => (
              <div
                key={s.value}
                className="rounded-2xl bg-white border border-section shadow-[var(--shadow-soft)] p-6 md:p-8 text-center md:text-left"
              >
                <p className="text-4xl md:text-5xl font-semibold text-accent mb-2 tracking-tight">
                  {s.value}
                </p>
                <p className="text-base font-semibold text-primary mb-3">
                  {s.label}
                </p>
                <p className="text-sm text-muted leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted mt-8">
            Sources: IMF estimates; projected AI job creation to 2030; Goldman
            Sachs on jobs exposed to AI-driven automation.
          </p>
        </div>
      </section>
      <UpcomingBatches />
      <BookShowcase />
      <section className="section-tint py-14 md:py-20">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl text-center mb-3">
            Kids use AI every day. Nobody has taught them how.
          </h2>
          <p className="text-center prose-muted mb-10 max-w-xl mx-auto">
            Using AI is easy. Understanding it is the real skill.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {problemPoints.map((p) => (
              <div key={p.title} className="card">
                <h3 className="text-lg mb-2">{p.title}</h3>
                <p className="text-[var(--color-muted)] text-[15px]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl text-center mb-3">
            Learn what matters. Think. Experiment. Create. Build.
          </h2>
          <p className="text-center prose-muted mb-12">
            Four weeks that change how your child sees and uses AI.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {overviewCards.map((c) => (
              <div key={c.title} className="card text-center">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="text-lg mb-2">{c.title}</h3>
                <p className="text-[var(--color-muted)] text-[15px]">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tint py-14 md:py-20">
        <div className="container-wide">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl mb-6 text-center">Course at a glance</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm mb-8">
              <div>
                <dt className="text-muted">Duration</dt>
                <dd className="font-semibold">4 weeks</dd>
              </div>
              <div>
                <dt className="text-muted">Format</dt>
                <dd className="font-semibold">Live online</dd>
              </div>
              <div>
                <dt className="text-muted">For</dt>
                <dd className="font-semibold">Class 4-9</dd>
              </div>
              <div>
                <dt className="text-muted">Bonus</dt>
                <dd className="font-semibold">Full workbook free</dd>
              </div>
            </dl>
            <div className="text-center">
              <Link href="/enroll" className="btn-primary">
                Reserve Your Child&apos;s Seat
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl text-center mb-10">
            What your child will learn
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {weeks.map((w) => (
              <div key={w.week} className="card">
                <span className="inline-block text-xs font-semibold uppercase tracking-wide text-secondary mb-2">
                  Week {w.week}
                </span>
                <h3 className="text-lg mb-1">{w.title}</h3>
                <p className="text-muted  text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/course"
              className="text-secondary font-medium underline underline-offset-2"
            >
              Full course details →
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tint py-14 md:py-20">
        <div className="container-wide max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl mb-4">Why parents trust us</h2>
          <p className="prose-muted mb-6">
            We studied AI for 4+ years in engineering and noticed children use
            AI daily, but few get taught how it works or how to question it.
            This course closes that gap — with clear explanations, hands-on
            practice, and a strong focus on safety.
          </p>
          {/* <p className="text-sm text-[var(--color-muted)]">
            [Testimonials will appear here once we have real parent feedback.]
          </p> */}
        </div>
      </section>
      <div className="">
        <Mentors />
      </div>

          <h1 className="text-2xl mt-10 md:text-4xl text-center font-semibold">
            Quick Answers
          </h1>
        <FAQ />
      {/* contact form */}
      <section className="bg-section">
        <div className="container-wide py-8">
          <div className="text-center mb-2">
            <h2 className="text-3xl font-semibold text-primary">
             Send us a message
            </h2>
            <p className="prose-muted mt-2">
              Talk to us about our AI learning programs.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
            <section className="py-16 md:py-24">
        <div className="container-wide text-center">
          <h2 className="text-2xl md:text-3xl mb-4">
            Give your child&apos;s curiosity a new direction.
          </h2>
          <p className="prose-muted mb-8 max-w-lg mx-auto">
            Join the next live batch. Complete workbook included free with every
            enrollment.
          </p>
          <Link href="/enroll" className="btn-primary">
            Enroll Now
          </Link>
        </div>
      </section>
    </>
  );
}
