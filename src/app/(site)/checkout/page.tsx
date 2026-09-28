import { getSiteSettings } from "@/lib/site-settings";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const settings = await getSiteSettings();
  return <CheckoutForm whatsappNumber={settings.whatsappNumber} />;
}
