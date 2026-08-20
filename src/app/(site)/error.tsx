"use client";

import { useEffect } from "react";
import Link from "next/link";
import { whatsappLink } from "@/lib/constants";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="font-serif text-2xl font-semibold text-maroon">Something went wrong</h1>
      <p className="mt-3 text-sm text-foreground/60">
        That didn&apos;t go through on our end. Nothing you did was lost — please try again, or
        message us on WhatsApp if it keeps happening.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-lg active:scale-95"
        >
          Try Again
        </button>
        <a
          href={whatsappLink("Hi! I ran into an issue on the House of Swasa website.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#25D366] px-5 py-2 text-sm font-semibold text-[#128C4A] hover:bg-[#25D366]/10"
        >
          Message us on WhatsApp
        </a>
        <Link href="/" className="text-sm font-medium text-maroon hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
