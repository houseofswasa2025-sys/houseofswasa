"use client";

import { motion } from "motion/react";
import { whatsappLink } from "@/lib/constants";

export function WhatsAppFloater({ number }: { number: string }) {
  const href = whatsappLink(
    "Hi House of Swasa! I'd like to know more about your sarees.",
    number
  );

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      className="animate-pulse-ring fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg sm:h-16 sm:w-16"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white sm:h-9 sm:w-9">
        <path d="M16.001 3C9.11 3 3.5 8.61 3.5 15.5c0 2.34.63 4.53 1.73 6.42L3 29l7.27-2.19a12.44 12.44 0 0 0 5.73 1.4h.01c6.89 0 12.5-5.61 12.5-12.5S22.89 3 16 3zm0 22.6a10.4 10.4 0 0 1-5.31-1.46l-.38-.23-4.32 1.3 1.29-4.21-.25-.4a10.34 10.34 0 0 1-1.63-5.6c0-5.73 4.66-10.4 10.4-10.4 2.78 0 5.39 1.08 7.36 3.04a10.33 10.33 0 0 1 3.04 7.36c0 5.73-4.67 10.2-10.2 10.2zm5.68-7.65c-.31-.16-1.84-.91-2.13-1.01-.29-.1-.5-.16-.71.16-.21.31-.81 1.01-1 1.22-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55-.18-.01-.39-.01-.6-.01s-.55.08-.84.39c-.29.31-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.37z" />
      </svg>
    </motion.a>
  );
}
