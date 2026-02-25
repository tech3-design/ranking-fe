import Link from "next/link";
import { routes } from "@/lib/config";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:px-10">
        <header className="mb-20 flex items-center justify-between">
          <div className="text-lg font-semibold">Signalor.ai</div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href={routes.signIn}>Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={routes.signUp}>Get started</Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              AI Search Visibility Platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Find how AI engines rank your brand, then fix what matters.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              Run instant GEO audits, benchmark competitors, and track technical,
              content, and E-E-A-T signals from one workflow.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={routes.signUp}>Start Free Analysis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.analyzer}>Open Analyzer</Link>
              </Button>
            </div>
          </div>

          <div className="glass-card relative rounded-2xl p-6 shadow-xl md:p-8">
            <p className="mb-4 text-sm font-semibold text-primary">
              What you get
            </p>
            <div className="space-y-4">
              {[
                "Composite score with pillar-by-pillar breakdown",
                "Competitor visibility and share-of-voice diagnostics",
                "Actionable recommendations with reporting exports",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
