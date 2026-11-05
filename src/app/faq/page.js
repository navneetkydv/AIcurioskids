import Link from "next/link";
import FAQ from "@/components/QuickAns";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about the 4-week live AI course for Class 4-9.",
};


export default function FAQPage() {

  return (
    <>
       <section className="bg-[var(--color-primary)] text-white py-14">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Quick Answers
          </h1>
        </div>
      </section>
    < FAQ />
    </>
  );
}
