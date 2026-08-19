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

export function AddToCartButton({ productId, slug, name, price, image, color, stock }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full rounded-full bg-foreground/20 px-5 py-2.5 text-sm font-semibold text-foreground/50"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <motion.button
        onClick={() => {
          addItem({ productId, slug, name, price, image, color, maxStock: stock });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        whileTap={{ scale: 0.95 }}
        animate={added ? { backgroundColor: "#16a34a" } : { backgroundColor: "#7a1f2f" }}
        transition={{ duration: 0.25 }}
        className="relative w-full overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={added ? "added" : "add"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="block"
          >
            {added ? "Added to Cart ✓" : "Add to Cart"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
