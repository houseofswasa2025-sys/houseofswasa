import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = req.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isAdminLogin) {
    const role = req.auth?.user?.role;
    if (role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
