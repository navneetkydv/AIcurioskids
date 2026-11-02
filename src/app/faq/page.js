import Link from "next/link";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about the 4-week live AI course for Class 5-8.",
};

const faqs = [
  {
    q: "What age / class is this for?",
    a: "The course is designed for students in Class 5 to Class 8.",
  },
  {
    q: "Does my child need to know coding?",
    a: "No. No coding is required. We focus on understanding AI, asking good questions, and using it safely.",
  },
  {
    q: "Is the book included?",
    a: "Yes. The complete “AI for Students” workbook is included free with every live-course enrollment. [Delivery details to be confirmed.]",
  },
  {
    q: "What if my child misses a class?",
    a: "[Missed class policy — e.g. recordings available for a limited time / make-up session. Fill in actual policy.]",
  },
  {
    q: "How do you ensure safety and supervision?",
    a: "[Safety and supervision details — live classes moderated, parental consent required, no private student-to-student messaging, etc.]",
  },
  {
    q: "What device is needed?",
    a: "A laptop or tablet with a stable internet connection. A quiet space for the live sessions helps.",
  },
  {
    q: "What is the refund policy?",
    a: "Please see our full Refund Policy page. [Link to /refund]. In short: [summary of actual policy].",
  },
  {
    q: "Who teaches the classes?",
    a: "Classes are led by [instructors — engineering graduates with AI background]. [Add real names/credentials when ready.]",
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-[var(--color-primary)] text-white py-14">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">FAQ</h1>
        </div>
      </section>
      <section className="py-14">
        <div className="container-wide max-w-2xl space-y-6">
          {faqs.map((f) => (
            <div key={f.q} className="card">
              <h2 className="text-lg font-semibold mb-2">{f.q}</h2>
              <p className="text-[var(--color-muted)] text-[15px]">{f.a}</p>
            </div>
          ))}
          <div className="text-center pt-8">
            <p className="prose-muted mb-4">Still have questions?</p>
            <Link href="/contact" className="btn-secondary">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
