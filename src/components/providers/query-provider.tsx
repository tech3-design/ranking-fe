"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Wraps the app in a single TanStack QueryClient. The client is created
 * inside a useState so React only constructs it once per browser tab ,
 * if we constructed it at module scope, every Server-Component render
 * would reuse the same instance across requests, leaking state.
 *
 * Defaults are conservative: 30s freshness, 1 retry, no auto-refetch on
 * window focus (the analyzer dashboard already has its own refetch
 * triggers via the org switcher and run context).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
