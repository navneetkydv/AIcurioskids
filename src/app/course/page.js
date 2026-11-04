import Link from "next/link";

export const metadata = {
  title: "The 4-Week Live AI Course",
  description:
    "Live online AI course for Class 4-9. 4 weeks, hands-on activities, complete workbook included free. Enroll now.",
};

const facts = [
  { label: "Duration", value: "4 weeks" },
  { label: "Format", value: "Live online" },
  { label: "For", value: "Class 4–9" },
  // { label: "Batch size", value: "[X]" },
  { label: "Sessions", value: "[2 per week, 90 minutes]" },
  // { label: "Next batch", value: "[date]" },
  { label: "Bonus", value: "Complete workbook FREE (delivered at  your home)" },
];

const weeks = [
  {
    week: 1,
    title: "Meet AI",
    items: ["What AI is", "Daily life examples", "How it learns"],
  },
  {
    week: 2,
    title: "Talk to AI",
    items: ["Better questions", "Clear prompts", "Getting useful answers"],
  },
  {
    week: 3,
    title: "Create and learn with AI",
    items: ["Understanding concepts", "Generating ideas", "Mini projects"],
  },
  {
    week: 4,
    title: "Stay safe, think ahead",
    items: ["Privacy", "Wrong answers", "Responsible use", "Future jobs and opportunities"],
  },
];

const learnings = [
  "Understand AI",
  "Talk to AI",
  "Use AI for learning",
  "Question AI's answers",
  "Stay safe",
  "Create with AI",
  "Think about the future",
];

const included = [
  "Live interactive classes",
  "Complete “AI for Students” workbook free (8 chapters, 40+ activities)",
  "Hands-on activities and mini projects",
  "Certificate of completion( available both digitally and physically delivered at home)  ",
  "24*7 support for parents and students",
];

export default function CoursePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "4-Week Live AI Course for Class 4-9",
    description:
      "Live online course that teaches how AI works, how to ask better questions, and how to use it safely.",
    provider: {
      "@type": "Organization",
      name: "AIcuriosKids",
    },
    educationalLevel: "Class 4-9",
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[var(--color-primary)] text-white py-14 md:py-20">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            The 4-Week Live AI Course
          </h1>
          <p className="text-lg text-white/85 max-w-2xl mb-8">
            Live classes for Class 4–9 students. Think clearly about AI, practice safely,
            and create with confidence. Complete workbook included free.
          </p>
          <Link href="/enroll" className="btn-primary">
            Reserve Your Child&apos;s Seat
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="container-wide">
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <tbody>
                {facts.map((f) => (
                  <tr key={f.label} className="border-b border-gray-100 last:border-0">
                    <th className="py-3 pr-4 font-medium text-[var(--color-muted)] w-1/3">
                      {f.label}
                    </th>
                    <td className="py-3 font-semibold">{f.value}</td>
                  </tr>
                ))}
                <tr>
                  <th className="py-3 pr-4 font-medium text-[var(--color-muted)]">Price</th>
                  <td className="py-3 font-semibold text-lg">[₹X]</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-6 text-center">
              <Link href="/enroll" className="btn-primary">
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tint py-14">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl text-center mb-10">Week by week</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {weeks.map((w) => (
              <div key={w.week} className="card">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                  Week {w.week}
                </span>
                <h3 className="text-xl mt-1 mb-3">{w.title}</h3>
                <ul className="space-y-1.5">
                  {w.items.map((item) => (
                    <li key={item} className="flex gap-2 text-[var(--color-muted)] text-sm">
                      <span className="text-[var(--color-success)]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl text-center mb-8">What your child will learn</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {learnings.map((l) => (
              <span
                key={l}
                className="px-4 py-2 rounded-full bg-[var(--color-section)] text-sm font-medium text-[var(--color-primary)]"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tint py-14">
        <div className="container-wide max-w-2xl">
          <h2 className="text-2xl md:text-3xl text-center mb-8">What&apos;s included</h2>
          <ul className="space-y-3">
            {included.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-[var(--color-success)] mt-0.5 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14">
        <div className="container-wide max-w-2xl">
          <h2 className="text-2xl md:text-3xl mb-4">Who it is for</h2>
          <p className="prose-muted mb-6">
            Parents of children in Class 4-9 in India who want their child to understand AI —
            not just use it. No prior coding knowledge is required. A laptop or tablet with a
            stable internet connection is enough.
          </p>
          <h2 className="text-2xl md:text-3xl mb-4 mt-10">Why we built this</h2>
          <p className="prose-muted">
            We studied AI for 4+ years in engineering and noticed children use AI daily,
            but few get taught how it works or how to question it. This course closes that gap.
          </p>
          {/* <p className="text-sm text-[var(--color-muted)] mt-6">
            [Testimonials placeholder — will be replaced with real parent quotes.]
          </p> */}
        </div>
      </section>

      <section className="section-tint py-16">
        <div className="container-wide text-center">
          <h2 className="text-2xl md:text-3xl mb-4">
            Give your child&apos;s curiosity a new direction.
          </h2>
          <p className="prose-muted mb-8">Complete workbook included FREE with enrollment.</p>
          <Link href="/enroll" className="btn-primary">
            Enroll Now
          </Link>
        </div>
      </section>
    </>
  );
}
