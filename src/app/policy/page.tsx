import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: May 8, 2026</p>
      </header>

      <section className="space-y-6 text-sm leading-7 text-foreground/90">
        <div>
          <p>
            This Privacy Policy explains how Signalor GEO (&ldquo;Signalor&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) collects, uses, and safeguards information when you use our website
            and services (the &ldquo;Service&rdquo;). By using the Service, you agree to the
            practices described below.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">1. Information We Collect</h2>
          <p className="mt-2">We collect the following categories of information:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Account information:</strong> email address, name, password hash, and
              authentication identifiers (including Google OAuth IDs when you sign in with Google).
            </li>
            <li>
              <strong>Workspace inputs:</strong> URLs you submit for analysis, brand and competitor
              configurations, prompts, and other content you provide.
            </li>
            <li>
              <strong>Integration data:</strong> OAuth tokens and metadata from connected services
              (e.g. Google Analytics 4, Shopify). Tokens are encrypted at rest.
            </li>
            <li>
              <strong>Crawl and analysis output:</strong> page content, schema, scoring results, and
              AI-generated reports we produce on your behalf.
            </li>
            <li>
              <strong>Billing information:</strong> processed by our payment provider (Dodo
              Payments). We store payment, subscription, and invoice identifiers, but do not store
              full card numbers.
            </li>
            <li>
              <strong>Usage and device data:</strong> log data, IP address, browser/device type,
              referrer, and timestamps of your interactions with the Service.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">2. How We Use Information</h2>
          <p className="mt-2">We use the information we collect to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide, operate, and maintain the Service;</li>
            <li>Run analyses, generate reports, and deliver feature output;</li>
            <li>Authenticate users and protect accounts from unauthorized access;</li>
            <li>Process payments, subscriptions, and referral discounts;</li>
            <li>Communicate with you about the Service, updates, and support requests;</li>
            <li>Improve product performance, troubleshoot issues, and prevent abuse;</li>
            <li>Comply with legal obligations and enforce our terms.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">3. Legal Basis for Processing (EEA/UK Users)</h2>
          <p className="mt-2">
            Where the GDPR or UK GDPR applies, we process personal data on the basis of: performance
            of a contract with you; our legitimate interests in operating and improving the Service;
            your consent (where required, e.g. for certain cookies); and compliance with legal
            obligations.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">4. Third-Party Services and Integrations</h2>
          <p className="mt-2">
            We use trusted third-party services to operate the platform. These providers process
            data only as needed to deliver their part of the Service:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Dodo Payments</strong> &mdash; payment processing, subscriptions, and
              invoices.
            </li>
            <li>
              <strong>Google</strong> &mdash; OAuth sign-in and Google Analytics 4 (when you connect
              a GA4 property).
            </li>
            <li>
              <strong>Shopify</strong> &mdash; store data when you connect a Shopify integration.
            </li>
            <li>
              <strong>Google Gemini</strong> &mdash; AI processing for entity extraction, AI
              visibility checks, and competitor discovery. We send only the inputs needed to
              generate the requested output.
            </li>
            <li>
              <strong>Hosting and infrastructure providers</strong> &mdash; for compute, storage,
              email delivery, and observability.
            </li>
          </ul>
          <p className="mt-2">
            You may revoke an integration at any time from your account settings . When you
            disconnect, we stop accessing the third party and delete or invalidate the associated
            tokens.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">5. Cookies and Similar Technologies</h2>
          <p className="mt-2">
            We use first-party cookies for authentication (session cookies) and to remember your
            preferences. Limited analytics cookies may be used to understand product usage. You can
            control cookies through your browser settings; disabling required cookies may affect
            functionality such as sign-in.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">6. Data Retention</h2>
          <p className="mt-2">
            We retain personal data for as long as your account is active or as needed to provide
            the Service, comply with legal obligations, resolve disputes, and enforce our
            agreements. Analyzer crawl snapshots and integration data are retained for up to 90 days
            unless you request earlier deletion or your subscription requires a longer retention
            window.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">7. Security</h2>
          <p className="mt-2">
            We use industry-standard safeguards including TLS in transit, encryption at rest for
            sensitive credentials (such as integration OAuth tokens), least-privilege access
            controls, and regular monitoring. No method of transmission or storage is 100% secure;
            we cannot guarantee absolute security.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">8. Your Rights</h2>
          <p className="mt-2">
            Depending on your location, you may have rights to access, correct, delete, restrict, or
            port your personal data, and to object to or withdraw consent for certain processing.
            California residents have additional rights under the CCPA/CPRA, including the right to
            know what is collected and the right to opt out of certain sharing.
          </p>
          <p className="mt-2">
            To exercise these rights, contact us using the details below. We will respond within the
            timeframe required by applicable law.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">9. International Data Transfers</h2>
          <p className="mt-2">
            We and our service providers may process data in countries other than your own. Where
            required, we rely on appropriate transfer mechanisms (such as Standard Contractual
            Clauses) to protect personal data.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">10. Children</h2>
          <p className="mt-2">
            The Service is not directed to children under 16, and we do not knowingly collect
            personal data from children. If you believe a child has provided us personal data,
            please contact us so we can delete it.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">11. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. Material changes will be
            communicated through the Service or by email. Continued use of the Service after a
            change means you accept the updated policy.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">12. Contact</h2>
          <p className="mt-2">
            For privacy-related questions, requests, or complaints, contact us at{" "}
            <a href="mailto:tech3@optiminastic.com" className="underline hover:text-foreground">
              tech3@optiminastic.com
            </a>
            .
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
