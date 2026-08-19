"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCartStore } from "@/lib/cart-store";

type Props = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  stock: number;
};

export function QuickAddButton({ productId, slug, name, price, image, color, stock }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (stock <= 0) {
    return (
      <button
        disabled
        className="mt-2 w-full rounded-full bg-foreground/10 px-3 py-1.5 text-xs font-semibold text-foreground/40"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <motion.button
      onClick={(e) => {
        e.preventDefault();
        addItem({ productId, slug, name, price, image, color, maxStock: stock });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      whileTap={{ scale: 0.95 }}
      animate={added ? { backgroundColor: "#16a34a" } : { backgroundColor: "#7a1f2f" }}
      transition={{ duration: 0.25 }}
      className="relative mt-2 w-full overflow-hidden rounded-full px-3 py-1.5 text-xs font-semibold text-white"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={added ? "added" : "add"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="block"
        >
          {added ? "Added ✓" : "Add to Cart"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
