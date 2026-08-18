import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { whatsappLink } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-maroon">Contact Us</h1>
      <p className="mt-2 text-sm text-foreground/60">
        We&apos;d love to hear from you — reach out anytime.
      </p>

      <div className="mt-8 space-y-4">
        <a
          href={whatsappLink("Hi House of Swasa! I have a question.", settings.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-gold-light/60 bg-white p-4 hover:border-maroon"
        >
          <div>
            <p className="font-medium text-foreground">WhatsApp</p>
            <p className="text-sm text-foreground/60">+{settings.whatsappNumber}</p>
          </div>
          <span className="text-[#25D366]">→</span>
        </a>

        <a
          href={`mailto:${settings.contactEmail}`}
          className="flex items-center justify-between rounded-xl border border-gold-light/60 bg-white p-4 hover:border-maroon"
        >
          <div>
            <p className="font-medium text-foreground">Email</p>
            <p className="text-sm text-foreground/60">{settings.contactEmail}</p>
          </div>
          <span className="text-maroon">→</span>
        </a>

        {settings.instagramUrl && (
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-gold-light/60 bg-white p-4 hover:border-maroon"
          >
            <div>
              <p className="font-medium text-foreground">Instagram</p>
              <p className="text-sm text-foreground/60">Follow us for the latest collections</p>
            </div>
            <span className="text-maroon">→</span>
          </a>
        )}
      </div>
    </div>
  );
}
