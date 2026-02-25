import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center px-4 py-6 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="glass-card hidden rounded-3xl p-10 md:flex md:flex-col md:justify-between">
          <div className="space-y-5">
            <Link href="/" className="inline-block text-lg font-semibold">
              Signalor.ai
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">
              Build a durable AI search presence for your brand.
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Understand where you stand, why you rank, and exactly what to
              improve to win more visibility.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "Single-page and site-wide GEO analysis",
              "Competitor and platform-level visibility insights",
              "Analytics integrations for impact tracking",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
