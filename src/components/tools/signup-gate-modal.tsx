"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "@/components/icons";
import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Wrap a free-tool result section with this component to gate the result
 * behind sign-up / sign-in. When the user has no session, the children are
 * rendered blurred and unreachable behind a centered modal prompting them
 * to create an account or log in. Signed-in users see the result normally
 * with no modal.
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
  body = "Your audit is ready. Create a free account or log in to view your score, recommendations, and pillar breakdown.",
}: {
  when: boolean;
  children: ReactNode;
  title?: string;
  body?: string;
}) {
  const { data: session, isPending } = useSession();
  const gated = when && !isPending && !session;

  // Lock body scroll while the modal is up so the page doesn't jump.
  useEffect(() => {
    if (!gated) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gated]);

  if (!when) return null;

  if (!gated) {
    // Signed in (or still resolving) — show the real result.
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Result, blurred and inert so the user sees there is data without reading it. */}
      <div aria-hidden className="pointer-events-none select-none blur-[6px] opacity-70">
        {children}
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div
          className={cn(
            "w-full max-w-md rounded-md border border-black/10 bg-white p-6 shadow-2xl",
          )}
        >
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              Unlock your result
            </p>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={nextHref(routes.signUp)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Create free account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={nextHref(routes.signIn)}
              className="inline-flex items-center justify-center rounded-sm border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-neutral-50"
            >
              Log in
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Free forever. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}

function nextHref(base: string) {
  if (typeof window === "undefined") return base;
  const next = window.location.pathname + window.location.search;
  return `${base}?next=${encodeURIComponent(next)}`;
}
