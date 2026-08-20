import { getSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "./settings-form";
import { NotificationToggle } from "./notification-toggle";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Settings</h1>
        <NotificationToggle />
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-maroon">Social Media & Contact</h2>
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
