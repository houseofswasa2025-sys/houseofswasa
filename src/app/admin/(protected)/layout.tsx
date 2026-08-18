import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Social Media" },
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
      <aside className="border-b border-gold-light/60 bg-white p-4 md:w-56 md:border-b-0 md:border-r">
        <p className="mb-4 px-2 font-serif text-lg font-semibold text-maroon">Swasa Admin</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-ivory hover:text-maroon"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          className="mt-4"
        >
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/60 hover:bg-ivory">
            Sign Out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
