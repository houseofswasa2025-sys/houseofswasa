import { getSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "./actions";

const FIELDS: { name: string; label: string; placeholder: string }[] = [
  { name: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/houseofswasa" },
  { name: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/houseofswasa" },
  { name: "whatsappUrl", label: "WhatsApp (channel/catalog link)", placeholder: "https://wa.me/919652282268" },
  { name: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@houseofswasa" },
  { name: "pinterestUrl", label: "Pinterest", placeholder: "https://pinterest.com/houseofswasa" },
];

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-maroon">Social Media & Contact</h1>
      <form action={updateSiteSettings} className="space-y-4 rounded-xl border border-gold-light/60 bg-white p-5">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label className="mb-1 block text-sm font-medium text-foreground/70">{f.label}</label>
            <input
              name={f.name}
              type="url"
              placeholder={f.placeholder}
              defaultValue={(settings[f.name as keyof typeof settings] as string) ?? ""}
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

        <button
          type="submit"
          className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white hover:bg-maroon-dark"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
