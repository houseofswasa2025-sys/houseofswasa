import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const ROLE_RECHECK_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;
        // Slow down password guessing against a single account.
        if (!(await rateLimit(`login:${identifier.toLowerCase()}`, 10, 15 * 60 * 1000))) return null;

        const user = await prisma.user.findFirst({
          where: { OR: [{ phone: identifier }, { email: identifier }] },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.phone = (user as { phone: string }).phone;
        token.roleCheckedAt = Date.now();
        return token;
      }
      // The role lives in a 30-day JWT. Re-read it every few minutes so a
      // removed or demoted admin loses access promptly instead of at expiry.
      const checkedAt = (token.roleCheckedAt as number | undefined) ?? 0;
      if (token.id && Date.now() - checkedAt > ROLE_RECHECK_MS) {
        const current = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (!current) return null;
        token.role = current.role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
});
