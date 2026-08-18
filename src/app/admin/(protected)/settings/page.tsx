import { getSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Social Media & Contact</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
