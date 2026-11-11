import Image from "next/image";
import Link from "next/link";
import DownloadResourceButton from "./DownloadResourceButton";

const amazonUrl = process.env.NEXT_PUBLIC_AMAZON_URL;
const tags = [
  "Class 4-9",
  "100 pages of learning",
  "40+ activities",
  "No coding required",
];
export default function BookShowcase({ showBookLink = false }) {
  return (
    <section
      className="py-16 md:py-24 bg-blue-50"
      aria-labelledby="book-showcase-title"
    >
      <div className="container-wide grid items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Book image */}
        {/* Book image */}
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative flex flex-col items-center">
            <div className="book-float">
              <Image
                src="/cover.jpg"
                alt="Cover of our book"
                width={420}
                height={560}
                sizes="(min-width: 768px) 420px, 70vw"
                className="h-auto w-[220px] rounded-md shadow-2xl sm:w-[280px] md:w-[360px]"
              />
            </div>

            {/* Shadow that breathes with the float */}
            <div
              aria-hidden="true"
              className="book-shadow mx-auto mt-6 h-4 w-3/4 rounded-full bg-black/20 blur-md"
            />

            <DownloadResourceButton
              resourceType="book-sample"
              fileUrl="/book-sample.pdf"
              fileName="book-sample.pdf"
              label="Download FREE book Sample"
              className=" inline-block text-sm text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            />
          </div>
        </div>

        {/* Text + actions */}
        <div className="order-2 text-center md:order-1 md:text-left">
          <h2
            id="book-showcase-title"
            className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Explore the Book
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base opacity-80 md:mx-0 md:text-lg">
            <span className="font-italic">'AI for Students' </span> is a
            beginner-friendly guide designed especially for Class 4-9 students
            who want to explore Artificial Intelligence in a simple, practical,
            and engaging way — with no coding required.
          </p>
          <ul
            className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start"
            aria-label="Book highlights"
          >
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-3.5 py-1.5 text-sm font-medium text-[var(--color-primary)]"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/book/order"
              className="btn-primary text-center inline-flex items-center justify-center gap-2"
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
                <path d="M6 7h12l1 14H5L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              Order Now
            </Link>

            {amazonUrl && (
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary gap-2 hover:bg-[var(--color-primary)] hover:text-white"
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
            )}
          </div>
          {showBookLink && (
            <div className="mt-4 ml-2 text-left">
              <Link
                href="/book"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Learn more about the book →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
