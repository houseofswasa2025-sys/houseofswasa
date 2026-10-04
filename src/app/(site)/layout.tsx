import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloater } from "@/components/whatsapp-floater";
import { getSiteSettings, getVisibleCategories } from "@/lib/site-settings";

// Pages under this layout are statically cached and rebuilt on demand via
// revalidateStorefront() whenever admin data or stock changes. The timed
// revalidate is only a safety net.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getVisibleCategories()]);

  return (
    <>
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppFloater number={settings.whatsappNumber} />
    </>
  );
}
