export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  authBaseUrl:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
} as const;

export const routes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/analyzer",
  authCallback: "/auth/callback",
  onboardingCompanyInfo: "/onboarding/company-info",
  analyzer: "/analyzer",
  analyzerHistory: "/analyzer/history",
  analyzerResults: (runId: string | number) => `/analyzer/${runId}`,
  analyzerReport: (runId: string | number) => `/analyzer/${runId}/report`,
  settingsIntegrations: "/settings/integrations",
  gaCallbackPage: "/settings/integrations/callback/google-analytics",
} as const;
