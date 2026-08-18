import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?redirect=/account");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const orderCount = await prisma.order.count({ where: { userId: session.user.id } });

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-serif text-2xl font-semibold text-maroon">My Account</h1>

      <div className="mt-6 rounded-xl border border-gold-light/60 bg-white p-4">
        <p className="text-sm text-foreground/60">Name</p>
        <p className="font-medium text-foreground">{user?.name}</p>
        <p className="mt-3 text-sm text-foreground/60">Phone</p>
        <p className="font-medium text-foreground">{user?.phone}</p>
        {user?.email && (
          <>
            <p className="mt-3 text-sm text-foreground/60">Email</p>
            <p className="font-medium text-foreground">{user.email}</p>
          </>
        )}
      </div>

      <Link
        href="/account/orders"
        className="mt-4 flex items-center justify-between rounded-xl border border-gold-light/60 bg-white p-4 hover:border-maroon"
      >
        <span className="font-medium text-foreground">My Orders</span>
        <span className="text-sm text-foreground/50">{orderCount} order{orderCount === 1 ? "" : "s"}</span>
      </Link>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-4"
      >
        <button className="w-full rounded-full border border-gold-light py-2.5 text-sm font-medium text-foreground/70 hover:border-maroon hover:text-maroon">
          Sign Out
        </button>
      </form>
    </div>
  );
}
