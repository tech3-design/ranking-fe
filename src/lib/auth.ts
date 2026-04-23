import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { Pool } from "pg";
import { sendOtpEmail } from "./services/email";

const require = createRequire(import.meta.url);
const databaseUrl = process.env.DATABASE_URL;

function getDatabaseClient() {
  if (databaseUrl) {
    return new Pool({ connectionString: databaseUrl });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production (Neon Postgres connection string).");
  }

  const sqlitePath = process.env.BETTER_AUTH_SQLITE_PATH ?? ".data/better-auth.sqlite";
  mkdirSync(dirname(sqlitePath), { recursive: true });
  const { DatabaseSync } = require("node:sqlite") as {
    DatabaseSync: new (path: string) => unknown;
  };
  return new DatabaseSync(sqlitePath);
}

const dbClient = getDatabaseClient();

const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET;

if (
  !authSecret ||
  authSecret === "default-secret" ||
  authSecret.includes("changeme-generate-a-random-secret-here")
) {
  throw new Error(
    "BETTER_AUTH_SECRET is missing or using a placeholder value. Set a strong secret in environment variables.",
  );
}

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  secret: authSecret,
  database: dbClient,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  session: {
    expiresIn: 60 * 60 * 24 * 10, // 10 days
    updateAge: 60 * 60 * 24, // refresh session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min cache to reduce DB lookups
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: isProduction, // false for localhost (HTTP), true for production (HTTPS)
  },
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: sendOtpEmail,
    }),
  ],
});
