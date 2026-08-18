import Link from "next/link";
import { whatsappLink, CONTACT } from "@/lib/constants";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="font-serif text-2xl font-semibold text-maroon">Order Placed!</h1>
      {order && (
        <p className="mt-2 text-sm text-foreground/70">
          Your order number is <span className="font-semibold text-foreground">{order}</span>
        </p>
      )}
      <p className="mt-4 text-sm text-foreground/60">
        We&apos;ll confirm your order and delivery timeline shortly. Payment is Cash on Delivery
        unless otherwise arranged via WhatsApp.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href={whatsappLink(`Hi! I just placed order ${order ?? ""}. Please confirm.`, CONTACT.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#25D366] px-5 py-2.5 text-sm font-semibold text-[#128C4A] hover:bg-[#25D366]/10"
        >
          Confirm on WhatsApp
        </a>
        <Link href="/sarees" className="text-sm font-medium text-maroon hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
