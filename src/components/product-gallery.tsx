"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const displayImages = images.length > 0 ? images : [""];

  return (
    <div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-ivory">
        <AnimatePresence mode="wait">
          {displayImages[active] ? (
            <motion.div
              key={displayImages[active]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={displayImages[active]}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center text-foreground/30">No Image</div>
          )}
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-0.5 ${
                active === i ? "border-maroon" : "border-gold-light/60"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
