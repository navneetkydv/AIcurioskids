
export const metadata = {
  title: "Refund Policy",
};

export default function RefundPage() {
  return (
    <section className="py-14">
      <div className="container-narrow prose-muted">
       
        <h1 className="text-3xl text-primary mb-6">Refund Policy</h1>
        <p className="text-sm mb-8">Last updated: [November 2026]</p>

        <h2 className="text-xl text-primary mt-8 mb-3">1. Overview</h2>
        <p>
          We want families to feel confident enrolling. This policy explains when refunds are
          available for the 4-week live AI course.
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">2. Full refund window</h2>
        <p>
          [Example: You may request a full refund within 48 hours of payment, provided the batch
          has not yet started. Fill in your actual policy.]
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">3. After the batch starts</h2>
        <p>
          [Example: Once live classes have begun, refunds are generally not available except in
          exceptional circumstances at our discretion.]
        </p>

        <h2 className="text-xl text-primar mt-8 mb-3">4. How to request</h2>
        <p>
          Email from the parent email used at enrollment, with the payment ID / order ID
          and reason. We aim to process approved refunds within [7–10] business days to the
          original payment method via Razorpay.
        </p>

        <h2 className="text-xl text-primary mt-8 mb-3">5. Book / materials</h2>
        <p>
          The workbook is included free with enrollment. If a physical copy has already been
          shipped, [policy for returns or deduction]. Digital access, if any, may be revoked on
          refund.
        </p>
      </div>
    </section>
  );
}
