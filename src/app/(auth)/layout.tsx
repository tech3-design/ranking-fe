import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#dfe1e7] p-0">
      <div className="grid min-h-screen w-full overflow-hidden bg-white md:grid-cols-[1.05fr_1fr]">
        <div className="relative overflow-hidden p-8 text-white md:flex md:flex-col md:justify-between md:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#5b86ff_0%,#3f40f0_28%,#2f31cf_52%,#2228a7_100%)]" />
          <div className="pointer-events-none absolute -bottom-14 -left-16 h-52 w-52 rounded-full bg-cyan-300/35 blur-3xl" />
          <div className="pointer-events-none absolute right-8 top-8 h-44 w-44 rounded-full bg-violet-200/35 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_32%,rgba(163,230,255,0.18)_68%,rgba(255,255,255,0.08)_100%)]" />

          <div className="relative space-y-5">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
              <span className="size-2 rounded-full bg-cyan-200" />
              Signalor.ai
            </Link>
            <p className="text-xs text-blue-100/90">Built for modern growth teams</p>
            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight md:text-6xl md:leading-[1.05]">
              Grow faster with answer-engine visibility that compounds.
            </h1>
            <p className="max-w-md text-sm text-blue-100/85 md:text-3xl md:leading-tight md:font-light">
              Analyze how your brand appears in AI results, benchmark competitors, and ship fixes with confidence.
            </p>
          </div>

          <div className="relative mt-12 space-y-3 md:mt-0">
            <p className="text-xs text-blue-100/90">Used by teams across</p>
            <div className="flex flex-wrap gap-2">
              {["Growth", "SEO", "Content", "Revenue"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-blue-50"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 md:px-10 md:py-10">
          <div className="w-full max-w-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
