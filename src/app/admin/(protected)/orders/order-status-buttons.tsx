"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { updateOrderStatus } from "./actions";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusButtons({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");

  function handleClick(s: OrderStatus) {
    setError("");
    setPendingStatus(s);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, s);
      if (result.error) setError(result.error);
      setPendingStatus(null);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleClick(s)}
            disabled={pending}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-60 ${
              status === s
                ? "bg-maroon text-white"
                : "border border-gold-light text-foreground/70 hover:border-maroon"
            }`}
          >
            {pendingStatus === s ? "Updating..." : s}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-700"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {status === "CANCELLED" && (
        <p className="mt-3 text-xs text-foreground/50">
          This order is cancelled — its items&apos; stock has been restored.
        </p>
      )}
    </div>
  );
}
