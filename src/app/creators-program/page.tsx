import Link from "next/link";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { ArrowRight, ChevronDown } from "@/components/icons";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
      [ {children} ]
    </p>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Apply",
      body: "Fill in the form. Auto-approved, your link is live in 30 seconds.",
    },
    {
      n: "02",
      title: "Share",
      body: "Post your link to YouTube, X, your newsletter — anywhere your audience hangs out.",
    },
    {
      n: "03",
      title: "Earn",
      body: "Get 20% of every first-time subscription. Payouts after a 30-day refund window.",
    },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {steps.map((s) => (
        <div key={s.n} className="rounded-xl border border-black/8 bg-white p-5">
          <p className="font-mono text-[11px] text-orange-700">{s.n}</p>
          <p className="mt-2 text-base font-semibold text-foreground">{s.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function PerksGrid() {
  const perks = [
    {
      title: "20% commission",
      body: "On every first paid invoice. Frozen at the moment of payment so you always know the math.",
    },
    {
      title: "10% off for your audience",
      body: "Applied automatically at checkout. No promo code to remember, no friction.",
    },
    {
      title: "30-day refund window",
      body: "Commissions lock once the refund window closes. Refunds reverse the entry — no chargebacks.",
    },
    {
      title: "Auto-approval",
      body: "Apply once, get your link instantly. No quotas, no kickoff calls, no waiting list.",
    },
    {
      title: "Last-click attribution",
      body: "30-day cookie. If someone clicks your link, you own the commission for the next 30 days.",
    },
    {
      title: "Monthly payouts",
      body: "Wise, PayPal, or bank transfer. We process all locked balances on the first of every month.",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {perks.map((p) => (
        <div key={p.title} className="rounded-xl border border-black/8 bg-white p-5">
          <p className="text-[14px] font-semibold text-foreground">{p.title}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">{p.body}</p>
        </div>
      ))}
    </div>
  );
}

function ProgramFaq() {
  const items = [
    {
      q: "When do I get paid?",
      a: "Commissions are released after the 30-day refund window closes on the original subscription. We process payouts monthly via Wise, PayPal, or bank transfer.",
    },
    {
      q: "Is the 20% one-time or recurring?",
      a: "One-time on the first paid invoice. We focus on quality acquisition rather than ongoing rev-share, so the commission is meaningful upfront.",
    },
    {
      q: "What does my audience get?",
      a: "A 10% discount applied automatically at checkout on Signalor subscriptions. The discount stacks with annual billing.",
    },
    {
      q: "Can I edit my profile later?",
      a: "Yes — re-submit the same email on the apply page and your details update. Your code stays the same.",
    },
    {
      q: "Are there any restrictions?",
      a: "No spam, no incentivised clicks (e.g. paying for clicks), no self-referral. We pause partners who violate these and forfeit pending balance.",
    },
    {
      q: "How do I track my earnings?",
      a: "Every creator gets a public dashboard at signalor.ai/creators-program/YOUR-CODE — bookmark it. Clicks, attributions, pending and locked commissions all live there.",
    },
  ];
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-xl border border-black/8 bg-white px-5 py-4"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-foreground">
            {item.q}
            <ChevronDown className="size-4 text-neutral-400 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

function PrimaryCta({ size = "lg" }: { size?: "lg" | "sm" }) {
  const sizing =
    size === "lg"
      ? "h-12 px-6 text-[14px]"
      : "h-10 px-5 text-[13px]";
  return (
    <Link
      href="/creators-program/apply"
      className={`inline-flex items-center gap-2 rounded-md bg-foreground font-semibold text-background shadow-sm hover:opacity-90 ${sizing}`}
    >
      Join the program
      <ArrowRight className="size-4" />
    </Link>
  );
}

export default function CreatorsProgramPage() {
  return (
    <LandingMarketingShell>
      {/* Hero */}
      <section className="px-6 py-16 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>creators program</Eyebrow>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.65rem] md:leading-[1.05]">
            Earn{" "}
            <span className="underline decoration-orange-400 decoration-dashed decoration-2 underline-offset-[6px]">
              20%
            </span>{" "}
            for every signup. Your audience saves{" "}
            <span className="underline decoration-orange-400 decoration-dashed decoration-2 underline-offset-[6px]">
              10%
            </span>
            .
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-600">
            Get a creator link in 30 seconds. Visitors land on Signalor with 10% off; you earn 20%
            on every first paid subscription. No quotas, no waiting list, no kickoff call.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <PrimaryCta />
            <Link
              href="#how"
              className="inline-flex items-center gap-1.5 rounded-md border border-black/12 bg-white px-5 py-2.5 text-[13px] font-semibold text-foreground hover:bg-neutral-50"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <ScreenHR />

      {/* How it works */}
      <section id="how" className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>how it works</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Three steps. Real revenue share.
          </h2>
          <div className="mt-8">
            <HowItWorks />
          </div>
        </div>
      </section>

      <ScreenHR />

      {/* Perks */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>what's in the deal</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built for creators, not for spreadsheets.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] text-neutral-600">
            Transparent commissions, automatic discount, and a public dashboard you can share with
            your accountant.
          </p>
          <div className="mt-8">
            <PerksGrid />
          </div>
        </div>
      </section>

      <ScreenHR />

      {/* FAQ */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>faq</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Common questions
          </h2>
          <div className="mt-8">
            <ProgramFaq />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-black/8 bg-neutral-50/60 px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Ready to share Signalor?
          </h2>
          <p className="mt-2 text-[14px] text-neutral-600">
            Apply now and get your creator link in 30 seconds.
          </p>
          <div className="mt-6 flex justify-center">
            <PrimaryCta />
          </div>
        </div>
      </section>

      <LandingFooter />
    </LandingMarketingShell>
  );
}
