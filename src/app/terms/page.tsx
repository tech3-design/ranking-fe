import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: February 26, 2026</p>
      </header>

      <section className="space-y-6 text-sm leading-7 text-foreground/90">
        <div>
          <h2 className="text-base font-semibold">1. Use of Service</h2>
          <p className="mt-2">
            You agree to use Signalor GEO in compliance with applicable laws and platform policies.
            You are responsible for content and data submitted through your account.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">2. Accounts and Security</h2>
          <p className="mt-2">
            You are responsible for maintaining the confidentiality of your credentials and all
            activity under your account.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">3. Third-Party Integrations</h2>
          <p className="mt-2">
            Integrations rely on third-party services. Availability and behavior of those services
            may affect platform features. You control and may revoke granted permissions.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">4. Intellectual Property</h2>
          <p className="mt-2">
            The platform, software, and related materials are owned by Signalor GEO or its licensors.
            No rights are granted except as expressly stated.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">5. Limitation of Liability</h2>
          <p className="mt-2">
            To the extent permitted by law, the service is provided &quot;as is&quot; without warranties,
            and liability is limited for indirect or consequential losses.
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
