
export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for AIcuriosKids – children's data, parental consent, and payment handling.",
};

export default function PrivacyPage() {
  return (
    <section className="py-14">
      <div className="container-narrow prose-muted">
       
        <h1 className="text-3xl text-primary mb-6">Privacy Policy</h1>
        <p className="text-sm mb-8">Last updated: [November, 2026]</p>

        <h2 className="text-xl text-primary mt-8 mb-3">1. Who we are</h2>
        <p>
          AIcuriosKids (&quot;we&quot;, &quot;us&quot;) operates this website and the 4-week live AI course.
          Contact: [hello@aicurioskids.in].
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">2. Data we collect</h2>
        <p>We collect only what is needed for enrollment and communication:</p>
        <ul className="list-disc pl-5 space-y-1 my-3">
          <li>Parent/guardian: name, email, phone, city</li>
          <li>Child: first name only, class</li>
          <li>Batch selection, payment status (via Razorpay)</li>
          <li>Contact form messages</li>
        </ul>
        <p>
          We do <strong>not</strong> collect child surname, school name, photos, or other sensitive
          personal data. We never collect payment card details; payments are handled by Razorpay.
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">3. Parental consent</h2>
        <p>
          Enrollment is only accepted from a parent or legal guardian. A verifiable consent
          checkbox is required, and we store the consent timestamp and policy version with the enrollment.
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">4. How we use data</h2>
        <ul className="list-disc pl-5 space-y-1 my-3">
          <li>To process enrollment and provide the course</li>
          <li>To send confirmation and operational emails</li>
          <li>To respond to contact requests</li>
        </ul>

        <h2 className="text-xl text-primary mt-8 mb-3">5. Payments</h2>
        <p>
          Payments are processed by Razorpay. We receive payment confirmation (order ID, payment ID,
          amount) but never store full card or UPI credentials.
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">6. Data retention</h2>
        <p>
          Enrollment and payment records are retained as required for accounting, legal obligations,
          and course delivery. Contact leads may be retained for a limited period for follow-up.
          You may request deletion of personal data by emailing hello@aicurioskids.in; we will respond within a
          reasonable time subject to legal retention requirements.
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">7. Children&apos;s data</h2>
        <p>
          We process minimal data about children solely to deliver the course, based on parental
          consent. Parents may request access, correction, or deletion of their child&apos;s data
          by contacting hello@aicurioskids.in.
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">8. Changes</h2>
        <p>
          We may update this policy. Material changes will be reflected on this page with an updated date.
        </p>
      </div>
    </section>
  );
}
