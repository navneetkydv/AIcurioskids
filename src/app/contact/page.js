import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <>
      <section className="bg-primary text-white py-14">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Contact
          </h1>
          <p className="text-white/80 mt-2">
            We usually reply within one business day.
          </p>
        </div>
      </section>

      <ContactForm />
    </>
  );
}