import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, whatsappLink } from "@/lib/constants";

type Settings = {
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappUrl: string | null;
  youtubeUrl: string | null;
  pinterestUrl: string | null;
  whatsappNumber: string;
  contactEmail: string;
};

export function SiteFooter({ settings }: { settings: Settings }) {
  const socials = [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "Facebook", href: settings.facebookUrl },
    {
      label: "WhatsApp",
      href: settings.whatsappUrl || whatsappLink("Hi House of Swasa!", settings.whatsappNumber),
    },
    { label: "YouTube", href: settings.youtubeUrl },
    { label: "Pinterest", href: settings.pinterestUrl },
  ].filter((s) => s.href);

  return (
    <footer className="mt-16 border-t border-gold-light/60 bg-ivory">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-brand text-lg font-medium text-maroon">{SITE_NAME}</h3>
          <p className="mt-1 text-xs italic text-foreground/60">{SITE_TAGLINE}</p>
          <p className="mt-3 text-sm text-foreground/70">
            A home-based saree boutique bringing beautiful, high-quality sarees to women who
            appreciate timeless style and exceptional craftsmanship.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-foreground/70">
            <li><Link href="/sarees" className="hover:text-maroon">Shop Sarees</Link></li>
            <li><Link href="/new-arrivals" className="hover:text-maroon">New Arrivals</Link></li>
            <li><Link href="/best-sellers" className="hover:text-maroon">Best Sellers</Link></li>
            <li><Link href="/offers" className="hover:text-maroon">Special Offers</Link></li>
            <li><Link href="/about" className="hover:text-maroon">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-foreground/70">
            <li><Link href="/faqs" className="hover:text-maroon">FAQs</Link></li>
            <li><Link href="/reviews" className="hover:text-maroon">Reviews</Link></li>
            <li><Link href="/contact" className="hover:text-maroon">Contact Us</Link></li>
            <li><Link href="/account/orders" className="hover:text-maroon">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Get in Touch</h4>
          <ul className="mt-3 space-y-2 text-sm text-foreground/70">
            <li>WhatsApp: +{settings.whatsappNumber}</li>
            <li>Email: {settings.contactEmail}</li>
          </ul>
          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gold-light px-3 py-1 text-xs font-medium text-maroon hover:bg-maroon hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gold-light/60 px-4 py-4 text-center text-xs text-foreground/60">
        <p>No Exchange / No Return on orders. Payment via WhatsApp QR code, Cash on Delivery available.</p>
        <p className="mt-1">© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
