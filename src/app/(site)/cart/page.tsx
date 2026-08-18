"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/constants";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-xl px-4 py-16 text-center"
      >
        <p className="text-lg font-medium text-foreground/70">Your cart is empty</p>
        <Link
          href="/sarees"
          className="mt-4 inline-block rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-lg active:scale-95"
        >
          Shop Sarees
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-maroon">Your Cart</h1>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={`${item.productId}-${item.color}`}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-3 rounded-xl border border-gold-light/60 bg-white p-3"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-ivory">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${item.slug}`} className="text-sm font-medium text-foreground hover:text-maroon">
                    {item.name}
                  </Link>
                  {item.color && <p className="text-xs text-foreground/50">Color: {item.color}</p>}
                  <p className="mt-1 text-sm font-semibold text-maroon">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color)}
                      className="h-7 w-7 rounded-full border border-gold-light text-sm transition-transform active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color)}
                      className="h-7 w-7 rounded-full border border-gold-light text-sm transition-transform active:scale-90 disabled:opacity-40"
                      disabled={item.quantity >= item.maxStock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.color)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        layout
        className="mt-6 rounded-xl border border-gold-light/60 bg-white p-4"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/70">Subtotal</span>
          <span className="font-semibold text-foreground">{formatPrice(totalPrice)}</span>
        </div>
        <p className="mt-1 text-xs text-foreground/50">Shipping calculated at confirmation. Cash on Delivery.</p>
        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-full bg-maroon py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-lg active:scale-95"
        >
          Proceed to Checkout
        </Link>
      </motion.div>
    </div>
  );
}
