import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { AdminNavLinks } from "./nav-links";
import { AdminMobileSidebar } from "./mobile-sidebar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-gold-light/60 bg-white p-4 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <AdminMobileSidebar
          logo={
            <Link href="/admin" className="flex items-center gap-2 px-2">
              <Image
                src="/images/logo-mark.png"
                alt="House of Swasa"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full bg-maroon object-contain p-1"
              />
              <div className="leading-tight">
                <p className="font-brand text-base font-medium text-maroon">House of Swasa</p>
                <p className="text-[11px] uppercase tracking-wide text-foreground/40">Admin</p>
              </div>
            </Link>
          }
        >
          <AdminNavLinks />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
            className="mt-2"
          >
            <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/60 transition-colors hover:bg-ivory md:py-2">
              Sign Out
            </button>
          </form>
        </AdminMobileSidebar>
      </aside>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
