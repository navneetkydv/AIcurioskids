
export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <section className="py-14">
      <div className="container-narrow prose-muted">

        <h1 className="text-3xl text-[var(--color-primary)] mb-6">Terms of Service</h1>
        <p className="text-sm mb-8">Last updated: [November, 2026]</p>

        <h2 className="text-xl text-[var(--color-primary)] mt-8 mb-3">1. Agreement</h2>
        <p>
          By enrolling in the course or using this website, you agree to these Terms and our
          Privacy Policy and Refund Policy.
        </p>

        <h2 className="text-xl text-[var(--color-primary)] mt-8 mb-3">2. Eligibility</h2>
        <p>
          The course is for students in Class 4-9. Enrollment must be completed by a parent or
          legal guardian who has authority to consent to the child&apos;s participation.
        </p>

        <h2 className="text-xl text-[var(--color-primary)] mt-8 mb-3">3. Course delivery</h2>
        <p>
          Classes are live online. Schedule, batch size, and format are as described on the course
          page at the time of enrollment. We may make reasonable changes (e.g. instructor, minor
          schedule adjustments) and will notify enrolled parents.
        </p>

        <h2 className="text-xl text-[var(--color-primary)] mt-8 mb-3">4. Conduct</h2>
        <p>
          Participants are expected to behave respectfully. We may remove a participant for
          disruptive or unsafe behaviour without refund in serious cases.
        </p>

        <h2 className="text-xl text-[var(--color-primary)] mt-8 mb-3">5. Intellectual property</h2>
        <p>
          Course materials, workbook content, and website content are owned by AIcuriosKids or its
          licensors. You may use them for personal learning only; redistribution or commercial use
          is not permitted.
        </p>

        <h2 className="text-xl text-[var(--color-primary)] mt-8 mb-3">6. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, our liability is limited to the amount you paid
          for the course. We are not liable for indirect or consequential damages.
        </p>

        <h2 className="text-xl text-[var(--color-primary)] mt-8 mb-3">7. Governing law</h2>
        <p>
          These terms are governed by the laws of India.
        </p>
      </div>
    </section>
  );
}
