import Link from "next/link";

export const metadata = {
  title: "About",
  description: "Meet the founders behind AIcuriosKids. Engineering graduates teaching AI to children the right way.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-[var(--color-primary)] text-white py-14">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">About us</h1>
        </div>
      </section>
      <section className="py-14">
        <div className="container-wide  prose-muted">
          <h2 className="text-2xl text-[var(--color-primary)] mb-4">Our story</h2>
          <p className="mb-4 text-[var(--color-body)]">
            We studied AI for 4+ years in engineering and noticed a simple gap: children
            already use AI every day — for homework, curiosity, and entertainment — but almost
            nobody teaches them how it works, when to trust it, or how to stay safe.
          </p>
          <p className="mb-4 text-[var(--color-body)]">
            AIcuriosKids was built to close that gap with clear explanations, hands-on practice,
            and a strong focus on responsibility. Our live course and the “AI for Students”
            workbook are designed specifically for Class 5–8 learners in India.
          </p>
          <h2 className="text-2xl text-[var(--color-primary)] mb-4 mt-10">Mission</h2>
          <p className="mb-4 text-[var(--color-body)]">
            Help every child think clearly about AI — so they can create with it, question it,
            and use it wisely.
          </p>
          {/* <h2 className="text-2xl text-[var(--color-primary)] mb-4 mt-10">Founders</h2>
          <p className="text-sm text-[var(--color-muted)] mb-2">
            [Founder photo placeholders and short bios go here.]
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            [Credentials / education details — add only what is accurate.]
          </p> */}
          <div className="mt-12">
            <Link href="/enroll" className="btn-primary">
              Enroll in the live course
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
