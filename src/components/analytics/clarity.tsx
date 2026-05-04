"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "wloufvwvwn";

export function ClarityInit() {
  useEffect(() => {
    if (!CLARITY_PROJECT_ID) return;
    if (typeof window === "undefined") return;
    try {
      Clarity.init(CLARITY_PROJECT_ID);
    } catch {
      // SDK swallows most errors; nothing to do here.
    }
  }, []);
  return null;
}
