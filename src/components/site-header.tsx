"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCartStore } from "@/lib/cart-store";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";
import { toSlug } from "@/lib/slug";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/sarees", label: "Sarees" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/offers", label: "Special Offers" },
  { href: "/about", label: "About Us" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

const ABOUT_INDEX = NAV_LINKS.findIndex((l) => l.href === "/about");

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-40 border-b border-gold-light/60 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Image
            src="/images/logo-mark.png"
            alt={SITE_NAME}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full bg-maroon object-contain p-1.5"
            priority
          />
          <span className="hidden font-brand text-xl font-medium text-maroon sm:block">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.slice(0, ABOUT_INDEX).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-maroon ${
                pathname === link.href ? "text-maroon" : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button className="text-sm font-medium text-foreground/80 hover:text-maroon">
              Collections ▾
            </button>
            <AnimatePresence>
              {categoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full grid w-64 origin-top-right grid-cols-1 gap-1 rounded-lg border border-gold-light bg-white p-3 shadow-lg"
                >
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/categories/${toSlug(cat)}`}
                      className="rounded px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-ivory hover:text-maroon"
                    >
                      {cat}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {NAV_LINKS.slice(ABOUT_INDEX).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-maroon ${
                pathname === link.href ? "text-maroon" : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/account"
            className="hidden text-sm font-medium text-foreground/80 hover:text-maroon sm:block"
          >
            Account
          </Link>
          <Link href="/cart" className="relative transition-transform active:scale-90">
            <svg className="h-6 w-6 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.94-4.693 2.436-7.152.083-.412-.223-.798-.643-.798H5.106M7.5 14.25 5.106 5.121M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm13.5 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="animate-pop absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[11px] font-semibold text-white"
              >
                {totalItems}
              </span>
            )}
          </Link>
          <button
            aria-label="Toggle menu"
            className="lg:hidden transition-transform active:scale-90"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="h-6 w-6 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-1 overflow-hidden border-t border-gold-light/60 bg-cream px-4 py-3 lg:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-ivory hover:text-maroon"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-gold-light/60 pt-2">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Collections
              </p>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/categories/${toSlug(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded px-2 py-1.5 text-sm text-foreground/80 hover:bg-ivory hover:text-maroon"
                >
                  {cat}
                </Link>
              ))}
            </div>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded border-t border-gold-light/60 px-2 pt-3 text-sm font-medium text-foreground/80 hover:text-maroon"
            >
              My Account
            </Link>
            <Link
              href="/faqs"
              onClick={() => setMenuOpen(false)}
              className="rounded px-2 py-1.5 text-sm text-foreground/80 hover:text-maroon"
            >
              FAQs
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
