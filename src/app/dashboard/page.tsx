"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { checkOrganizationExists } from "@/lib/api/organizations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/lib/config";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.push(routes.signIn);
      return;
    }

    // Ensure user has completed onboarding
    checkOrganizationExists(session.user.email)
      .then((exists) => {
        if (exists) {
          setVerified(true);
        } else {
          router.replace(routes.onboardingCompanyInfo);
        }
      })
      .catch(() => setVerified(true)); // If check fails, show dashboard anyway
  }, [isPending, session, router]);

  if (isPending || !session || !verified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.push(routes.signIn);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to your dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Signed in as {session.user.email}
          </p>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
