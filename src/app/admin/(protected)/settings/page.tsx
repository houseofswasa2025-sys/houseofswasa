import { getSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-maroon">Social Media & Contact</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
