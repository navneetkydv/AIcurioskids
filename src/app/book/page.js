import Link from "next/link";
import BookShowcase from "@/components/BookShowcase";

export const metadata = {
  title: "The Book – AI for Students",
  description:
    "Beginner-friendly AI guide for Class 4-9. 8 chapters, 40+ hands-on activities. Buy on Amazon.",
};

const learnings = [
  "What AI is and how it shows up in daily life",
  "How to ask better questions and write clear prompts",
  "Using AI to understand school subjects",
  "Spotting wrong or biased answers",
  "Privacy and what not to share",
  "Creative challenges and mini projects",
  "Thinking about future skills and opportunities",
];

export default function BookPage() {
  const amazonUrl =
    process.env.NEXT_PUBLIC_AMAZON_URL ||
    "https://www.amazon.in/[your-book-asin]";

  return (
    <>
      <section className="bg-primary text-white py-14 md:py-20">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Prefer to learn at home? Get the book.
          </h1>
          <p className="text-lg text-white/85 mb-8">
            A beginner-friendly guide for Class 4–9 students. 8 chapters, 40+
            hands-on activities, creative challenges. No coding required.
            Suitable for independent learning, learning with parents, or
            classroom use.
          </p>
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary gap-2 "
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h3l2.7 12.4a1 1 0 001 .8h9.3a1 1 0 001-.8L21 7H6" />
            </svg>
            Buy on Amazon
          </a>
        </div>
      </section>
< BookShowcase />
      <section className="py-14">
        <div className="container-wide">
          <h2 className="text-2xl mb-6">What your child will learn</h2>
          <ul className="space-y-3 mb-12">
            {learnings.map((l) => (
              <li key={l} className="flex gap-3">
                <span className="text-success">✓</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>

          <div className="card section-tint border-0">
            <p className="text-body mb-4">
              Want live guidance too? The book comes free with our 4-week live
              course.
            </p>
            <Link
              href="/course"
              className="text-secondary font-semibold underline"
            >
              Explore the live course →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
