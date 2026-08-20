"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start px-2 py-12">
      <h1 className="text-xl font-bold text-maroon">Something went wrong</h1>
      <p className="mt-2 text-sm text-foreground/60">
        This page hit an error. Your data is safe — try again, and if it keeps happening let
        Revanth know.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-white hover:bg-maroon-dark"
        >
          Try Again
        </button>
        <Link href="/admin" className="text-sm font-medium text-maroon hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
