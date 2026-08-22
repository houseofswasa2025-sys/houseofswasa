"use client";

import { useEffect, useRef, useState, useTransition } from "react";

type Props = {
  action: () => Promise<void> | void;
  className?: string;
  pendingLabel: string;
  children: React.ReactNode;
  confirmMessage?: string;
};

const CONFIRM_TIMEOUT_MS = 4000;

export function AdminActionButton({ action, className, pendingLabel, children, confirmMessage }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function run() {
    startTransition(async () => {
      await action();
    });
  }

  function cancelConfirm() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5" title={confirmMessage}>
        <span className="text-xs text-foreground/60">Sure?</span>
        <button
          type="button"
          onClick={() => {
            cancelConfirm();
            run();
          }}
          className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={cancelConfirm}
          className="rounded-full border border-gold-light px-2 py-0.5 text-xs font-medium text-foreground/60 hover:border-maroon"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirmMessage) {
          setConfirming(true);
          timerRef.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
          return;
        }
        run();
      }}
      className={className}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
