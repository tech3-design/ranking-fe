import Link from "next/link";

import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IntegrationDetailCta() {
  return (
    <section className="border-t border-black/8 bg-muted/30 px-6 py-14 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="max-w-md text-lg font-semibold tracking-tight text-foreground">
          OAuth and sync controls live in your Signalor workspace after you sign in.
        </p>
        <Button asChild className={cn(LANDING_PRIMARY_CTA_CLASS, "shrink-0 px-5")}>
          <Link href="/sign-up">Create account</Link>
        </Button>
      </div>
    </section>
  );
}
