"use client";

import { Bell } from "lucide-react";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";

export default function NotificationsSettingsPage() {
  return (
    <div className="px-2 py-2 space-y-6 font-sans">
      <DashboardSettingsNav label="Notifications" />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Notifications</h2>
        <p className="mt-1 text-[13px] font-light leading-relaxed text-accent-foreground">
          Manage email notifications and alerts.
        </p>
      </div>

      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-black/8 bg-white text-primary shadow-sm">
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Coming Soon</p>
          <p className="max-w-xs text-center text-[12px] font-light leading-snug text-accent-foreground">
            Notification preferences will be available here. You&apos;ll be able to configure email digests, analysis alerts, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
