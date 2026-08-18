"use client";

import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { updateSiteSettings } from "./actions";
import type { SiteSettings } from "@/generated/prisma/client";

const FIELDS: { name: string; label: string; placeholder: string }[] = [
  { name: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/houseofswasa" },
  { name: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/houseofswasa" },
  { name: "whatsappUrl", label: "WhatsApp (channel/catalog link)", placeholder: "https://wa.me/919652282268" },
  { name: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@houseofswasa" },
  { name: "pinterestUrl", label: "Pinterest", placeholder: "https://pinterest.com/houseofswasa" },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, undefined);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2800);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-gold-light/60 bg-white p-5">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label className="mb-1 block text-sm font-medium text-foreground/70">{f.label}</label>
          <input
            name={f.name}
            type="url"
            placeholder={f.placeholder}
            defaultValue={(settings[f.name as keyof SiteSettings] as string) ?? ""}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
      ))}

      <div className="grid grid-cols-1 gap-4 border-t border-gold-light/60 pt-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">WhatsApp Number</label>
          <input
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Contact Email</label>
          <input
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save Settings"}
        </button>

        <AnimatePresence>
          {showToast && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-sm font-medium text-green-700"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">✓</span>
              Settings saved
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
