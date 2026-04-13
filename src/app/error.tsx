"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import LogoComp from "@/components/LogoComp";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/config";

export default function ErrorBoundary({
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
    <div className="signalor-body min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <header className="absolute top-0 left-0 right-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <LogoComp />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-28 lg:px-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />
          <div className="absolute top-1/4 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-lg text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Something went wrong
          </p>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            We hit a{" "}
            <span className="text-muted-foreground">snag</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            This section couldn&apos;t load. Try again, or go back to the homepage.
            {process.env.NODE_ENV === "development" && error.message ? (
              <span className="mt-3 block rounded-lg border border-border bg-muted/50 p-3 text-left font-mono text-xs text-foreground">
                {error.message}
              </span>
            ) : null}
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="rounded-full px-8" onClick={() => reset()} type="button">
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-border px-8" asChild>
              <Link href="/">
                <Home className="size-4" />
                Go to homepage
              </Link>
            </Button>
          </div>

          <p className="mt-12 text-xs text-muted-foreground">
            Free GEO check —{" "}
            <Link href={routes.analyzer} className="font-medium text-primary underline-offset-4 hover:underline">
              Run an audit
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
