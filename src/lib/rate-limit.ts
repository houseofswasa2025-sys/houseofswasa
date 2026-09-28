import { prisma } from "@/lib/prisma";

// Fixed-window limiter stored in Postgres (RateLimit table), so the limit
// holds across all serverless instances. One atomic upsert per call: the
// counter resets once its window has passed. Returns true when allowed.
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const windowSeconds = windowMs / 1000;
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= now() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= now()
          THEN now() + make_interval(secs => ${windowSeconds})
          ELSE "RateLimit"."resetAt" END
      RETURNING "count"`;
    return Number(rows[0]?.count ?? 1) <= limit;
  } catch (error) {
    // Never lock everyone out because the limiter itself failed.
    console.error("Rate limit check failed:", error);
    return true;
  }
}
