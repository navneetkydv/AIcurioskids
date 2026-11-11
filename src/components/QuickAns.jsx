"use client";

import { useState } from "react";
import Link from "next/link";
const PHONE_DISPLAY = "+91 88002 61719"; // replace with your number
const PHONE_HREF = "tel:+918800261719";  // no spaces

const faqs = [
  {
    q: "Who is this program for?",
    a: "This program is designed for students from Grades 4–9 who want to explore emerging career opportunities, understand the future of work, and prepare for success in an AI-driven world.",
  },
  {
    q: "Do students need any prior experience?",
    a: "No prior experience is required. The program is designed for beginners and curious learners who want to explore AI and future career opportunities.",
  },
  {
    q: "Are physical certificates available for all participants?",
    a: "Physical certificates are available only to participants who have opted for and paid the applicable certificate fee. Delivery will be made only to addresses within India.",
  },
  {
    q: "Is there any discount available?",
    a: "No additional discounts are available beyond the officially announced program fee.",
  },
  {
    q: "What will my child learn in this program?",
    a: "Students will gain insights into high-growth careers, future workplace trends, evolving industries, and the opportunities being created by advances in technology and innovation.",
  },
  {
    q: "What is the class format?",
    a: "The program consists of live, interactive online sessions designed to provide practical learning and active participation.",
  },
  {
    q: "Is this program interactive or just theory-based?",
    a: "It is highly interactive. Students will participate in demonstrations, activities, discussions, challenges, and hands-on exercises using AI tools.",
  },
  {
    q: "Can my child attend if they miss a session?",
    a: "Session recordings are generally not provided; however, in genuine urgent or exceptional cases, recording access may be considered at the discretion of the program team.",
  },
  {
    q: "Will students receive a certificate?",
    a: "Certificates will be awarded to all eligible participants. A minimum attendance of 5 classes is mandatory to receive the certificate.",
  },
  {
    q: "How will this help my child academically and in the future?",
    a: "The program helps students strengthen critical thinking, problem-solving, and digital skills, enabling them to make smarter academic choices while preparing for emerging careers and future workplace demands.",
  },
  {
    q: "Is this suitable for students with no technical background?",
    a: "Absolutely. The program is designed in a simple and engaging manner, making AI accessible and easy to understand for students from all backgrounds.",
  },
  {
    q: "What if my child has doubts after class?",
    a: "All doubts and queries may be shared over email or WhatsApp. The mentors and internal team will assist and respond.",
  },
  {
    q: "Can two children or siblings attend using one registration?",
    a: "No. Each registration is valid for one student only. Every registration includes participation access and certification for a single student only, and certificates are non-transferable.",
  },
  {
    q: "Can parents attend along with students?",
    a: "Yes, parents may accompany students during sessions. However, students are encouraged to participate independently to maximize their learning experience.",
  },
  {
    q: "What rewards or recognition will students receive?",
    a: "All students will receive a Certificate of Participation upon successful completion of the program. Additionally, selected students may get an opportunity to be featured on the website, and special prizes will be awarded to outstanding performers based on overall performance.",
  },
 
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const toggleFAQ = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

   

      <section className="py-14">
        <div className="container-wide max-w-2xl space-y-4">

          {faqs.map((f, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={f.q}
                className="card overflow-hidden"
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <h2 className="text-base md:text-lg font-semibold">
                    {f.q}
                  </h2>

                  <span
                    className={`text-2xl shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    +
                  </span>
                </button>

                {/* Answer */}
                <div
                  id={`faq-answer-${index}`}
                  hidden={!isOpen}
                >
                  <div className="pt-4">
                    <p className="text-[var(--color-muted)] text-[15px] leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Contact */}
       <div className="pt-8 text-center">
  <p className="prose-muted mb-4">Still have questions?</p>

  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
    <Link href="/contact" className="btn-secondary">
      Contact us
    </Link>

    <a
      href={PHONE_HREF}
      className="inline-flex items-center gap-2 font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)]"
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
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
      </svg>
      <span>{PHONE_DISPLAY}</span>
    </a>
  </div>
</div>

        </div>
      </section>
    </>
  );
}