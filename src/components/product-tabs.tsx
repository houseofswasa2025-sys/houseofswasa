"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ProductGrid } from "@/components/product-grid";
import type { ProductWithColors } from "@/lib/products";

type Tab = {
  key: string;
  label: string;
  href: string;
  products: ProductWithColors[];
};

export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-full border border-gold-light/60 bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab.key === tab.key ? "text-white" : "text-foreground/70 hover:text-maroon"
              }`}
            >
              {activeTab.key === tab.key && (
                <motion.span
                  layoutId="product-tab-pill"
                  className="absolute inset-0 rounded-full bg-maroon"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>
        <Link href={activeTab.href} className="text-sm font-medium text-maroon hover:underline">
          View all
        </Link>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductGrid products={activeTab.products.slice(0, 8)} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
