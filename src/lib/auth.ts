import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { sendOtpEmail } from "@/lib/services/email";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

export const auth = betterAuth({
  secret: authSecret,
  database: pool,
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: sendOtpEmail,
    }),
  ],
});
