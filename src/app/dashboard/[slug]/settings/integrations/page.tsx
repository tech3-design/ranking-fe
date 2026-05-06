"use client";

import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";
import AnalyticsPage from "../../analytics/page";

export default function IntegrationsSettingsPage() {
  return (
    <div className="px-2 py-2 space-y-6 font-sans">
      <DashboardSettingsNav label="Integrations" />
      <AnalyticsPage />
    </div>
  );
}
