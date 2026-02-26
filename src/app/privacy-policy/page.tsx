import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: February 26, 2026</p>
      </header>

      <section className="space-y-6 text-sm leading-7 text-foreground/90">
        <div>
          <h2 className="text-base font-semibold">1. Information We Collect</h2>
          <p className="mt-2">
            We collect account details, workspace inputs (such as URLs and analysis settings),
            integration metadata, and usage data needed to provide and secure the service.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">2. How We Use Information</h2>
          <p className="mt-2">
            We use data to run analyses, deliver reports, improve product performance, support users,
            and protect platform integrity.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">3. Integrations and Third Parties</h2>
          <p className="mt-2">
            If you connect third-party platforms, we access only the scopes you authorize. You may
            disconnect integrations at any time from your account settings.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">4. Data Retention</h2>
          <p className="mt-2">
            We retain data for as long as needed to provide services, satisfy legal requirements,
            and resolve disputes. You can request deletion based on applicable law.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">5. Contact</h2>
          <p className="mt-2">
            For privacy-related requests, contact your account owner or designated support channel.
          </p>
        </div>
      </section>

      <footer className="mt-10 border-t border-border pt-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Back to Home
        </Link>
      </footer>
    </main>
  );
}
