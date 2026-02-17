export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  authBaseUrl:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
} as const;

export const routes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  authCallback: "/auth/callback",
  onboardingCompanyInfo: "/onboarding/company-info",
} as const;
