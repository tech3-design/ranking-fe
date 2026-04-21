import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { sendOtpEmail } from "./services/email";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required (Neon Postgres connection string).");
}

const pool = new Pool({ connectionString: databaseUrl });

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
  database: pool,
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
