import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

export function getResend() {
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  return new Resend(apiKey);
}

export async function sendEnrollmentConfirmation({
  to,
  parentName,
  childName,
  batchName,
  startDate,
  amount,
}) {
  const resend = getResend();
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Enrollment confirmed – [Brand Name] AI Course`,
    html: `
      <p>Hi ${parentName},</p>
      <p>Thank you for enrolling <strong>${childName}</strong> in the 4-week live AI course.</p>
      <p><strong>Batch:</strong> ${batchName}<br/>
      <strong>Starts:</strong> ${startDate}<br/>
      <strong>Amount paid:</strong> ₹${amount}</p>
      <p>You will receive batch details and the WhatsApp group link shortly.</p>
      <p>If you have questions, reply to this email or message us on WhatsApp.</p>
      <p>— [Brand Name] Team</p>
    `,
  });
}

export async function sendAdminNotification({
  parentName,
  parentEmail,
  childName,
  batchName,
  amount,
}) {
  const resend = getResend();
  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `New enrollment: ${childName} – ₹${amount}`,
    html: `
      <p>New paid enrollment</p>
      <ul>
        <li>Parent: ${parentName} (${parentEmail})</li>
        <li>Child: ${childName}</li>
        <li>Batch: ${batchName}</li>
        <li>Amount: ₹${amount}</li>
      </ul>
    `,
  });
}
