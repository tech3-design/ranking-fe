import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: May 8, 2026</p>
      </header>

      <section className="space-y-6 text-sm leading-7 text-foreground/90">
        <div>
          <p>
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the
            Signalor GEO website, applications, and services (collectively, the &ldquo;Service&rdquo;)
            provided by Signalor GEO (&ldquo;Signalor&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
            By creating an account or using the Service, you agree to these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">1. Eligibility and Acceptance</h2>
          <p className="mt-2">
            You must be at least 16 years old and capable of entering a binding agreement to use
            the Service. If you use the Service on behalf of an organization, you represent that
            you have authority to bind that organization to these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">2. The Service</h2>
          <p className="mt-2">
            Signalor GEO provides generative-engine-optimization tooling, including site analysis,
            scoring, recommendations, AI visibility checks, and integrations with third-party
            platforms. Features and limits depend on your subscription plan and may change over
            time.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">3. Accounts and Security</h2>
          <p className="mt-2">
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity that occurs under your account. Notify us promptly of any unauthorized
            use. We may suspend or terminate accounts that violate these Terms or pose a security
            risk.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">4. Subscriptions, Billing, and Refunds</h2>
          <p className="mt-2">
            Paid plans are billed in advance on a recurring basis through our payment provider,
            Dodo Payments. By subscribing, you authorize recurring charges until cancellation.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Subscriptions renew automatically at the end of each billing cycle unless cancelled
              before the renewal date.
            </li>
            <li>
              You may cancel at any time from your account settings; cancellation takes effect at
              the end of the current billing period.
            </li>
            <li>
              Except where required by law, fees are non-refundable. Promotional pricing, referral
              discounts, and trial credits are subject to their specific terms.
            </li>
            <li>
              We may change plans, pricing, or features with reasonable notice. Material changes
              will not apply until your next renewal.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">5. Acceptable Use</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Use the Service to violate any applicable law or third-party right;</li>
            <li>
              Submit URLs or content you are not authorized to analyze, or that infringe third-party
              rights;
            </li>
            <li>
              Attempt to disrupt, reverse engineer, decompile, or gain unauthorized access to the
              Service or related systems;
            </li>
            <li>
              Use the Service to send spam, malware, or to scrape, mirror, or resell platform
              output without permission;
            </li>
            <li>
              Bypass usage limits, rate limits, or security features, or share account credentials.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">6. User Content</h2>
          <p className="mt-2">
            You retain ownership of the content you submit to the Service (URLs, brand inputs,
            prompts, and similar). You grant Signalor a limited, worldwide, non-exclusive license
            to host, process, and use that content solely to operate, secure, and improve the
            Service. You are responsible for ensuring you have the rights to submit that content.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">7. Third-Party Integrations</h2>
          <p className="mt-2">
            The Service integrates with third-party platforms (including Google, Shopify, and Dodo
            Payments) and may rely on third-party AI models (such as Google Gemini). Those services
            are governed by their own terms and privacy policies. Their availability, performance,
            and behavior are outside our control. You are responsible for any access tokens you
            grant and may revoke them at any time.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">8. Intellectual Property</h2>
          <p className="mt-2">
            The Service, including its software, designs, trademarks, and documentation, is owned
            by Signalor and its licensors and is protected by intellectual property laws. We grant
            you a limited, non-exclusive, non-transferable right to access and use the Service in
            accordance with these Terms. No other rights are granted, expressly or by implication.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">9. AI-Generated Output</h2>
          <p className="mt-2">
            Portions of the Service produce AI-generated reports, scores, and recommendations.
            These are provided for informational purposes and may contain inaccuracies. You should
            independently verify important results before relying on them, and you are responsible
            for decisions made based on Service output.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">10. Disclaimers</h2>
          <p className="mt-2">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
            WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED
            OPERATION. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE OR THAT OUTPUTS WILL
            ACHIEVE ANY SPECIFIC OUTCOME.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">11. Limitation of Liability</h2>
          <p className="mt-2">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIGNALOR WILL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE,
            DATA, OR GOODWILL, ARISING OUT OF OR RELATING TO THE SERVICE. OUR TOTAL LIABILITY FOR
            ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID
            TO US IN THE TWELVE MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">12. Indemnification</h2>
          <p className="mt-2">
            You agree to defend, indemnify, and hold harmless Signalor and its officers, employees,
            and affiliates from any claims, damages, liabilities, and expenses (including
            reasonable legal fees) arising out of your use of the Service, your content, or your
            violation of these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">13. Termination</h2>
          <p className="mt-2">
            You may stop using the Service at any time. We may suspend or terminate your access if
            you breach these Terms, if required by law, or to protect the Service or other users.
            Sections that by their nature should survive termination (e.g. ownership, disclaimers,
            limitation of liability, indemnification) will survive.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">14. Governing Law and Disputes</h2>
          <p className="mt-2">
            These Terms are governed by the laws of the jurisdiction in which Signalor is
            established, without regard to conflict-of-laws rules. Disputes will be resolved by the
            competent courts of that jurisdiction, except where mandatory consumer-protection law
            grants you alternative rights.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">15. Changes to These Terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. Material changes will be communicated
            through the Service or by email. Continued use of the Service after the changes take
            effect means you accept the updated Terms.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">16. Contact</h2>
          <p className="mt-2">
            Questions about these Terms? Contact us at
            {" "}
            <a
              href="mailto:tech3@optiminastic.com"
              className="underline hover:text-foreground"
            >
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
