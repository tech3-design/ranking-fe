export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  authBaseUrl:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
} as const;

/**
 * Self-hosted WordPress plugin zips in `public/downloads/`.
 * When you release a new build: bump `version`, run `python scripts/build_signalor_geo_zip.py`,
 * commit both zips, and set `zipPathVersioned` to match (e.g. signalor-geo-1.0.2.zip).
 */
export const signalorWpPlugin = {
  version: "1.0.1",
  zipPath: "/downloads/signalor-geo.zip",
  zipPathVersioned: "/downloads/signalor-geo-1.0.1.zip",
} as const;

export const routes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  authCallback: "/auth/callback",
  onboardingCompanyInfo: "/onboarding/company-info",
  dashboardNew: "/dashboard/new",
  dashboardProject: (slug: string) => `/dashboard/${slug}`,
  dashboardProjectRecommendations: (slug: string) => `/dashboard/${slug}/recommendations`,
  dashboardProjectVisibility: (slug: string) => `/dashboard/${slug}/visibility`,
  dashboardProjectPrompts: (slug: string) => `/dashboard/${slug}/prompts`,
  dashboardProjectAnalytics: (slug: string) => `/dashboard/${slug}/analytics`,
  dashboardProjectIntegrations: (slug: string) => `/dashboard/${slug}/integrations`,
  // kept for backward compat with existing sub-pages and PDF
  analyzer: "/analyzer",
  analyzerResults: (runId: string | number) => `/analyzer/${runId}`,
  analyzerIntegrations: (runId: string | number) => `/analyzer/${runId}/integrations`,
  analyzerAnalytics: (runId: string | number) => `/analyzer/${runId}/analytics`,
  settingsAccount: "/settings/account",
  settingsBilling: "/settings/billing",
  settingsIntegrations: "/settings/integrations",
  settingsNotifications: "/settings/notifications",
  gaCallbackPage: "/settings/integrations/callback/google-analytics",
} as const;
