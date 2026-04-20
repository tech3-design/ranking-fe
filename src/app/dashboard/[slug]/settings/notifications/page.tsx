"use client";

import { Bell } from "lucide-react";

export default function NotificationsSettingsPage() {
  return (
    <div className="px-2 py-2 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Notifications</h2>
        <p className="text-xs mt-1 text-muted-foreground">Manage email notifications and alerts.</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Coming Soon</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Notification preferences will be available here. You&apos;ll be able to configure email digests, analysis alerts, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
