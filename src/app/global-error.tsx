"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Root-level error UI when the root layout fails. Must define <html> and <body>.
 * Pairs with App Router the way pages/_error.js pairs with Pages Router in production.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="light">
      <body className="signalor-body m-0 min-h-screen bg-[#f7f7f7] font-sans text-[#171717] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
            Critical error
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Signalor couldn&apos;t start this view
          </h1>
          <p className="mt-4 max-w-md text-center text-sm text-neutral-600">
            Please refresh the page. If it keeps happening, try again later or contact support.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F95C4B] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-92"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
