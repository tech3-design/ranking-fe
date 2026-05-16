"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Wraps the app in a single TanStack QueryClient. The client is created
 * inside a useState so React only constructs it once per browser tab ,
 * if we constructed it at module scope, every Server-Component render
 * would reuse the same instance across requests, leaking state.
 *
 * Cache defaults are tuned so that flipping between dashboard tabs does
 * NOT re-trigger a network round-trip + loading skeleton on the way back:
 *   - staleTime 5 min  : data is "fresh" — useQuery returns cached on remount
 *   - gcTime 30 min    : cached results survive route unmount/remount
 *   - refetchOnMount   : `false` for stable data, components that need
 *                        live data should opt in per-query
 *   - refetchOnWindowFocus / Reconnect: off, the analyzer dashboard
 *     already has its own refetch triggers (org switcher, run context).
 *
 * Individual queries can still opt back into shorter staleTime / mount
 * refetch by passing those options to useQuery() — these are just the
 * defaults.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
            retry: 1,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
