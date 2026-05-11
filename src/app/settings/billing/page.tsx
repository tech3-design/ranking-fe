"use client";

import { AppSidebar } from "@/components/navigation/app-sidebar";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingSettingsPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex h-full w-full overflow-hidden border border-border/60 bg-background/30">
        <AppSidebar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <SettingsNav />
            <div>
              <h1 className="text-2xl font-bold">Billing</h1>
              <p className="mt-1 text-muted-foreground">
                Manage your subscription and payment details.
              </p>
            </div>
            <Card className="glass-card border-border/70">
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Billing management coming soon.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
