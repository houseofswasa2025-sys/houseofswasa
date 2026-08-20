"use client";

import { useTransition } from "react";

type Props = {
  action: () => Promise<void> | void;
  className?: string;
  pendingLabel: string;
  children: React.ReactNode;
  confirmMessage?: string;
};

export function AdminActionButton({ action, className, pendingLabel, children, confirmMessage }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await action();
        });
      }}
      className={className}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
