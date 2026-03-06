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
  dashboardNew: "/dashboard/new",
  dashboardProject: (slug: string) => `/dashboard/${slug}`,
  dashboardProjectAnalytics: (slug: string) => `/dashboard/${slug}/analytics`,
  dashboardProjectIntegrations: (slug: string) => `/dashboard/${slug}/integrations`,
  // kept for backward compat with existing sub-pages and PDF
  analyzer: "/analyzer",
  analyzerResults: (runId: string | number) => `/analyzer/${runId}`,
  analyzerIntegrations: (runId: string | number) => `/analyzer/${runId}/integrations`,
  analyzerAnalytics: (runId: string | number) => `/analyzer/${runId}/analytics`,
  settingsIntegrations: "/settings/integrations",
  settingsAccount: "/settings/account",
  gaCallbackPage: "/settings/integrations/callback/google-analytics",
} as const;
