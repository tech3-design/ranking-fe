import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import LogoComp from "@/components/LogoComp";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/config";

export default function NotFound() {
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

        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
          <h1 className="font-sans text-6xl font-black leading-[0.95] tracking-tighter text-foreground sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="block text-muted-foreground sm:inline sm:after:content-['\00a0']">
              Error
            </span>
            <span className="text-primary">404</span>
          </h1>
          <p className="mx-auto mt-6 font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            This page drifted{" "}
            <span className="text-muted-foreground">off the map</span>
          </p>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            The URL may be wrong or the page was moved. Head back to Signalor
            and keep improving how AI cites your brand.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/">
                <Home className="size-4" />
                Go to homepage
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-border px-8" asChild>
              <Link href={routes.analyzer}>
                <Search className="size-4" />
                Run free GEO audit
              </Link>
            </Button>
          </div>

          <p className="mt-12 text-xs text-muted-foreground">
            Want full GEO tooling?{" "}
            <Link href="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
              View pricing
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
