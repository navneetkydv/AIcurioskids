import Image from "next/image";
import Link from "next/link";

const amazonUrl = process.env.NEXT_PUBLIC_AMAZON_URL;

export default function BookShowcase() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="book-showcase-title">
      <div className="container-wide grid items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Book image */}
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative">
            <div className="book-float">
              <Image
                src="/images/book-cover.png"
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
            Short description of the book goes here: what it teaches and who it
            is for.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/book" className="btn-primary text-center">
              Explore Book
            </Link>

            {amazonUrl && (
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border-2 border-[var(--color-primary)] px-6 py-3 text-center font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
              >
                Buy on Amazon
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}