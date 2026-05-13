"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "@/components/icons";
import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/config";

/**
 * Wrap a free-tool result section with this component to gate the result
 * behind sign-up / sign-in. Signed-in users see the result unchanged.
 * Anonymous users see an inline card with sign-up / log-in CTAs sitting
 * above a soft-faded version of the result — no full-screen modal, no
 * body scroll lock, no darkening of the whole page.
 *
 * Usage:
 *   <SignupGateOverlay when={state.kind === "done"}>
 *     <ResultCards detail={...} />
 *   </SignupGateOverlay>
 */
export function SignupGateOverlay({
  when,
  children,
  title = "Sign up to see your full result",
  body = "Create a free account or log in to view your score, recommendations, and pillar breakdown.",
}: {
  when: boolean;
  children: ReactNode;
  title?: string;
  body?: string;
}) {
  const { data: session, isPending } = useSession();
  const gated = when && !isPending && !session;

  if (!when) return null;
  if (!gated) return <>{children}</>;

  return (
    <div className="relative mt-6">
      {/* Inline sign-up card */}
      <div className="mb-4 rounded-lg border border-primary/30 bg-white p-6 shadow-[0_2px_12px_rgba(228,96,85,0.08)]">
        <div className="flex items-start gap-3">
          <div className="hidden shrink-0 sm:block">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={nextHref(routes.signIn)}
                className="inline-flex items-center justify-center rounded-sm border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-neutral-50"
              >
                Log in
              </Link>
              <Link
                href={nextHref(routes.signUp)}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:brightness-110"
              >
                Sign up free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Faded result preview — visible enough to know the audit ran, masked
          enough that the user has to sign up to actually read it. */}
      <div aria-hidden className="pointer-events-none select-none [filter:blur(3px)] opacity-50">
        {children}
      </div>
    </div>
  );
}

function nextHref(base: string) {
  if (typeof window === "undefined") return base;
  const next = window.location.pathname + window.location.search;
  return `${base}?next=${encodeURIComponent(next)}`;
}
