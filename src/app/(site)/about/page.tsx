import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-maroon">About Us</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
        <p>
          Welcome to <strong>House of Swasa</strong>, where tradition meets elegance. We are a
          home-based saree boutique dedicated to bringing beautiful, high-quality sarees to women
          who appreciate timeless style and exceptional craftsmanship.
        </p>
        <p>
          Our journey began with a passion for Indian textiles and a desire to make exquisite
          sarees accessible to customers at affordable prices. Every saree in our collection is
          carefully selected for its quality, design, and comfort, ensuring that you receive only
          the best.
        </p>
        <p>
          Our collection includes Silk, Cotton, Organza, Banarasi, Kanjivaram, Linen, and festive
          wear sarees suitable for weddings, celebrations, office wear, and everyday elegance.
        </p>
        <p>
          We believe that every woman deserves to feel confident and beautiful in what she wears.
          That&apos;s why we focus on quality, honest pricing, personalized customer service, and a
          smooth shopping experience.
        </p>
        <p>
          Thank you for supporting our home-grown business. We are honored to be a part of your
          celebrations and everyday moments, and we look forward to serving you with care and
          dedication.
        </p>
      </div>
    </div>
  );
}
