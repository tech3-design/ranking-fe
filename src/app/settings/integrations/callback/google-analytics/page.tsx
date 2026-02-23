"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendGACallback } from "@/lib/api/integrations";
import { routes } from "@/lib/config";

export default function GACallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Missing authorization parameters.");
      return;
    }

    sendGACallback(code, state)
      .then(() => {
        router.replace(routes.settingsIntegrations);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.error ||
          "Failed to connect Google Analytics.";
        setError(msg);
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive max-w-md text-center">
          {error}
        </div>
        <button
          onClick={() => router.push(routes.settingsIntegrations)}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">
        Connecting Google Analytics...
      </p>
    </div>
  );
}
