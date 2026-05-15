"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import { useConsentStore } from "@/lib/stores/consent-store";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "wloufvwvwn";

let inited = false;

export function ClarityInit() {
  const analytics = useConsentStore((s) => s.analytics);
  const hydrated = useConsentStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated || !analytics) return;
    if (inited) return;
    if (!CLARITY_PROJECT_ID) return;
    if (typeof window === "undefined") return;
    inited = true;
    try {
      Clarity.init(CLARITY_PROJECT_ID);
    } catch {
      // SDK swallows most errors; nothing to do here.
    }
  }, [hydrated, analytics]);

  return null;
}
