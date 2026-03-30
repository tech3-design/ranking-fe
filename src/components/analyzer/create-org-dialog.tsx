"use client";

import { useRouter } from "next/navigation";

interface CreateOrgDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

/**
 * "New Organization" just redirects to the full onboarding flow.
 * This ensures platform selection, store connect, and password are handled.
 */
export function CreateOrgDialog({ open, onClose }: CreateOrgDialogProps) {
  const router = useRouter();

  if (!open) return null;

  // Redirect to onboarding — same 3-step flow as first signup
  router.push("/onboarding/company-info");
  onClose();
  return null;
}
