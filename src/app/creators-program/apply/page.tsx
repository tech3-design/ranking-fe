"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  applyToCreatorsProgram,
  type AudienceSize,
  type CreatorApplyResponse,
  type PayoutMethod,
  type SocialEntry,
} from "@/lib/api/partners-program";
import { COUNTRIES, flagEmoji } from "@/lib/countries";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  Search,
} from "@/components/icons";

interface PlatformDef {
  key: string;
  label: string;
  placeholder: string;
}

const PLATFORMS: PlatformDef[] = [
  { key: "youtube", label: "YouTube", placeholder: "@channel" },
  { key: "x", label: "X (Twitter)", placeholder: "@handle" },
  { key: "instagram", label: "Instagram", placeholder: "@handle" },
  { key: "tiktok", label: "TikTok", placeholder: "@handle" },
  { key: "linkedin", label: "LinkedIn", placeholder: "in/handle" },
  { key: "substack", label: "Substack", placeholder: "newsletter url" },
  { key: "podcast", label: "Podcast", placeholder: "show name" },
  { key: "blog", label: "Blog", placeholder: "blog url" },
];

const AUDIENCE_SIZES: { value: AudienceSize; label: string }[] = [
  { value: "<1k", label: "Under 1k" },
  { value: "1k-10k", label: "1k – 10k" },
  { value: "10k-100k", label: "10k – 100k" },
  { value: "100k-1m", label: "100k – 1M" },
  { value: "1m+", label: "1M+" },
];

interface PayoutMethodDef {
  value: PayoutMethod;
  label: string;
  hint: string;
  placeholder: string;
}

const PAYOUT_METHODS: PayoutMethodDef[] = [
  {
    value: "wise",
    label: "Wise",
    hint: "Cheapest international transfer for most creators.",
    placeholder: "Wise email or @wisetag",
  },
  {
    value: "paypal",
    label: "PayPal",
    hint: "Quick if you already use PayPal.",
    placeholder: "PayPal email",
  },
  {
    value: "bank",
    label: "Bank transfer",
    hint: "Direct deposit to your local bank account.",
    placeholder: "Account holder name, account number, IFSC/SWIFT, bank name",
  },
  {
    value: "crypto",
    label: "Crypto wallet",
    hint: "USDC or USDT on Polygon, Base, or Ethereum.",
    placeholder: "Network (e.g. USDC on Polygon) + wallet address",
  },
  {
    value: "other",
    label: "Other",
    hint: "We'll work it out — payoneer, UPI, anything reasonable.",
    placeholder: "Tell us how you'd like to be paid",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
      [ {children} ]
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
      {children}
    </label>
  );
}

function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(
    () => COUNTRIES.find((c) => c.code === value),
    [value],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-black/[0.12] bg-white px-3 text-left text-[13px]",
          "focus:outline-none focus:ring-2 focus:ring-orange-400/40",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <span className="text-base leading-none">{flagEmoji(selected.code)}</span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-neutral-400">Select country</span>
          )}
        </span>
        <ChevronDown
          className={cn("size-4 text-neutral-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-black/10 bg-white shadow-lg">
          <div className="border-b border-black/6 px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                autoFocus
                placeholder="Search country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded border border-black/8 bg-white py-1.5 pl-7 pr-2 text-[12px] focus:outline-none"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-neutral-500">No matches.</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-neutral-50",
                      c.code === value && "bg-orange-50 text-orange-700",
                    )}
                  >
                    <span className="text-base leading-none">{flagEmoji(c.code)}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-[10px] text-neutral-400">{c.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function SocialPlatformsField({
  value,
  onChange,
}: {
  value: SocialEntry[];
  onChange: (next: SocialEntry[]) => void;
}) {
  const handleFor = (platform: string) =>
    value.find((e) => e.platform === platform)?.handle ?? "";

  const togglePlatform = (platform: string) => {
    const exists = value.some((e) => e.platform === platform);
    if (exists) {
      onChange(value.filter((e) => e.platform !== platform));
    } else {
      onChange([...value, { platform, handle: "" }]);
    }
  };

  const updateHandle = (platform: string, handle: string) => {
    onChange(
      value.map((e) => (e.platform === platform ? { ...e, handle } : e)),
    );
  };

  const enabled = new Set(value.map((e) => e.platform));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => {
          const on = enabled.has(p.key);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => togglePlatform(p.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                on
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-black/12 bg-white text-neutral-600 hover:border-neutral-400",
              )}
            >
              {on && <Check className="mr-1 inline size-3" />}
              {p.label}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((entry) => {
            const def = PLATFORMS.find((p) => p.key === entry.platform);
            return (
              <div key={entry.platform} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-[12px] font-medium text-neutral-700">
                  {def?.label ?? entry.platform}
                </span>
                <Input
                  value={handleFor(entry.platform)}
                  onChange={(e) => updateHandle(entry.platform, e.target.value)}
                  placeholder={def?.placeholder ?? "@handle"}
                  className="h-9 border-black/12 bg-white text-[13px]"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApplyForm({
  onSuccess,
}: {
  onSuccess: (res: CreatorApplyResponse) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [socials, setSocials] = useState<SocialEntry[]>([]);
  const [audience, setAudience] = useState<AudienceSize>("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("wise");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePayout =
    PAYOUT_METHODS.find((p) => p.value === payoutMethod) ?? PAYOUT_METHODS[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Add your name.");
    if (!email.trim()) return setError("Add your email.");
    if (!country) return setError("Pick a country.");
    const trimmedSocials = socials
      .map((s) => ({ ...s, handle: s.handle.trim() }))
      .filter((s) => s.handle);
    if (trimmedSocials.length === 0)
      return setError("Add at least one social platform with a handle.");
    if (!payoutDetails.trim() || payoutDetails.trim().length < 3)
      return setError("Add the details we need to pay you.");

    setSubmitting(true);
    try {
      const res = await applyToCreatorsProgram({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        country,
        social_platforms: trimmedSocials,
        audience_size: audience || undefined,
        payout_method: payoutMethod,
        payout_details: payoutDetails.trim(),
      });
      onSuccess(res);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Couldn't submit your application. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl rounded-2xl border border-black/8 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Creator"
            className="h-10 border-black/12 bg-white text-[13px]"
          />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="h-10 border-black/12 bg-white text-[13px]"
          />
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Country</FieldLabel>
        <CountrySelect value={country} onChange={setCountry} />
      </div>

      <div className="mt-4">
        <FieldLabel>Where you create</FieldLabel>
        <SocialPlatformsField value={socials} onChange={setSocials} />
      </div>

      <div className="mt-4">
        <FieldLabel>Audience size (optional)</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {AUDIENCE_SIZES.map((b) => {
            const on = audience === b.value;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => setAudience(on ? "" : b.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                  on
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-black/12 bg-white text-neutral-600 hover:border-neutral-400",
                )}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-black/8 bg-neutral-50/50 p-4">
        <FieldLabel>How should we pay you?</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {PAYOUT_METHODS.map((p) => {
            const on = payoutMethod === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPayoutMethod(p.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                  on
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-black/12 bg-white text-neutral-600 hover:border-neutral-400",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">{activePayout.hint}</p>
        <div className="mt-3">
          <FieldLabel>Payout details</FieldLabel>
          <textarea
            value={payoutDetails}
            onChange={(e) => setPayoutDetails(e.target.value)}
            placeholder={activePayout.placeholder}
            rows={payoutMethod === "bank" || payoutMethod === "other" ? 3 : 2}
            className="w-full resize-y rounded-md border border-black/12 bg-white px-3 py-2 text-[13px] leading-relaxed text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Stored privately. We never display this on your public dashboard.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="mt-6 h-11 w-full gap-2 bg-foreground text-[14px] font-semibold text-background hover:opacity-90"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        {submitting ? "Submitting…" : "Get my creator link"}
      </Button>

      <p className="mt-3 text-center text-[11px] text-neutral-500">
        Auto-approved. You'll see your link instantly.
      </p>
    </form>
  );
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-black/12 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : label || "Copy"}
    </button>
  );
}

function SuccessCard({ result }: { result: CreatorApplyResponse }) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
          <Check className="size-4" />
        </span>
        <p className="text-[13px] font-semibold text-emerald-800">
          {result.created ? "You're in." : "Welcome back."}
        </p>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        Hi {result.name}, here's your creator link
      </h2>
      <p className="mt-1 text-[13px] text-neutral-600">
        Share this anywhere. Visitors land on Signalor with 10% off; you earn{" "}
        {result.commission_percent}% on every first-time subscription.
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Your code
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded-md border border-black/10 bg-white px-3 py-1.5 font-mono text-[14px] font-semibold text-foreground">
              {result.code}
            </code>
            <CopyButton value={result.code} label="Copy code" />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Share link
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-black/10 bg-white px-3 py-1.5 font-mono text-[12px] text-foreground">
              {result.share_url}
            </code>
            <CopyButton value={result.share_url} label="Copy link" />
          </div>
        </div>
      </div>

      <Link
        href={`/creators-program/${result.code}`}
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background hover:opacity-90"
      >
        Visit your dashboard
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export default function CreatorsApplyPage() {
  const [result, setResult] = useState<CreatorApplyResponse | null>(null);

  return (
    <LandingMarketingShell>
      <section className="px-6 py-12 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/creators-program"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-neutral-500 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to overview
          </Link>
          <div className="mt-6 text-center">
            <Eyebrow>apply</Eyebrow>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {result ? "Welcome to the program" : "Join the Creators Program"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-600">
              {result
                ? "Your creator link is live. Share it anywhere and start earning."
                : "Tell us about you and we'll mint your creator link instantly. Already applied? Submit the same email to update your details — your code stays the same."}
            </p>
          </div>
        </div>

        <div className="mt-10">
          {result ? <SuccessCard result={result} /> : <ApplyForm onSuccess={setResult} />}
        </div>
      </section>

      <LandingFooter />
    </LandingMarketingShell>
  );
}
