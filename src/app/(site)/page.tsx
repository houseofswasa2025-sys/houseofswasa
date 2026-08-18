import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product-grid";
import { CATEGORIES, SITE_TAGLINE } from "@/lib/constants";
import { toSlug } from "@/lib/slug";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { HeroLogo, HeroStagger, HeroItem } from "@/components/hero-animate";

const WHY_CHOOSE_US = [
  "Premium Quality Fabrics",
  "Carefully Curated Collections",
  "Affordable Prices",
  "Secure Payments",
  "Fast Shipping",
  "Excellent Customer Support",
];

export default async function HomePage() {
  const [newArrivals, bestSellers, settings, reviews] = await Promise.all([
    getProducts({ flag: "isNewArrival", sort: "newest" }),
    getProducts({ flag: "isBestSeller" }),
    getSiteSettings(),
    prisma.review.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-ivory to-cream px-4 py-16 text-center sm:py-24">
        <HeroLogo>
          <Image
            src="/images/logo.jpeg"
            alt="House of Swasa"
            width={96}
            height={96}
            className="mx-auto rounded-full object-cover shadow-md"
          />
        </HeroLogo>
        <HeroStagger>
          <HeroItem>
            <h1 className="mt-6 font-serif text-3xl font-semibold text-maroon sm:text-5xl">
              House of Swasa
            </h1>
          </HeroItem>
          <HeroItem>
            <p className="mt-2 italic text-foreground/60">{SITE_TAGLINE}</p>
          </HeroItem>
          <HeroItem>
            <p className="mx-auto mt-4 max-w-xl text-sm text-foreground/70 sm:text-base">
              Where tradition meets elegance. Handpicked Silk, Cotton, Banarasi, Kanjivaram and festive
              sarees for every celebration.
            </p>
          </HeroItem>
          <HeroItem className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sarees"
              className="rounded-full bg-maroon px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-lg active:scale-95"
            >
              Shop Sarees
            </Link>
            <Link
              href="/new-arrivals"
              className="rounded-full border border-maroon px-6 py-3 text-sm font-semibold text-maroon transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon/5 active:scale-95"
            >
              New Arrivals
            </Link>
          </HeroItem>
        </HeroStagger>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <Reveal>
          <h2 className="mb-4 text-center font-serif text-2xl font-semibold text-maroon">
            Shop by Category
          </h2>
        </Reveal>
        <RevealGroup className="flex snap-x gap-3 overflow-x-auto pb-2" stagger={0.04}>
          {CATEGORIES.map((cat) => (
            <RevealItem key={cat} className="shrink-0">
              <Link
                href={`/categories/${toSlug(cat)}`}
                className="snap-start block shrink-0 rounded-full border border-gold-light bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-maroon hover:text-maroon hover:shadow-md active:scale-95"
              >
                {cat}
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <Reveal className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-maroon">New Arrivals</h2>
            <Link href="/new-arrivals" className="text-sm font-medium text-maroon hover:underline">
              View all
            </Link>
          </Reveal>
          <ProductGrid products={newArrivals.slice(0, 8)} />
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <Reveal className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-maroon">Best Sellers</h2>
            <Link href="/best-sellers" className="text-sm font-medium text-maroon hover:underline">
              View all
            </Link>
          </Reveal>
          <ProductGrid products={bestSellers.slice(0, 8)} />
        </section>
      )}

      <section className="bg-ivory py-12">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <h2 className="mb-6 text-center font-serif text-2xl font-semibold text-maroon">Why Choose Us</h2>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {WHY_CHOOSE_US.map((item) => (
              <RevealItem key={item}>
                <div className="flex h-full items-start gap-2 rounded-xl bg-white p-4 text-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <span className="text-maroon">✔</span>
                  <span className="text-foreground/80">{item}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <Reveal>
            <h2 className="mb-6 text-center font-serif text-2xl font-semibold text-maroon">
              What Our Customers Say
            </h2>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {reviews.map((r) => (
              <RevealItem key={r.id}>
                <div className="h-full rounded-xl border border-gold-light/60 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  <p className="mt-2 text-sm italic text-foreground/70">&ldquo;{r.text}&rdquo;</p>
                  <p className="mt-2 text-xs font-medium text-foreground/50">— {r.name}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <div className="mt-6 text-center">
            <Link href="/reviews" className="text-sm font-medium text-maroon hover:underline">
              Read more reviews
            </Link>
          </div>
        </section>
      )}

      {settings.instagramUrl && (
        <Reveal className="mx-auto max-w-3xl px-4 pb-16 text-center">
          <h2 className="font-serif text-2xl font-semibold text-maroon">Follow Us on Instagram</h2>
          <p className="mt-1 text-sm text-foreground/60">
            See our latest sarees and behind-the-scenes moments.
          </p>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-lg active:scale-95"
          >
            @houseofswasa
          </a>
        </Reveal>
      )}
    </div>
  );
}
