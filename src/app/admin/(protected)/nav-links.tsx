"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/whatsapp", label: "WhatsApp Interest" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Social Media" },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-maroon text-white" : "text-foreground/70 hover:bg-ivory hover:text-maroon"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
