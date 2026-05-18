"use client";

import { useEffect } from "react";
import * as amplitude from "@amplitude/unified";
import { useConsentStore } from "@/lib/stores/consent-store";

let inited = false;

export function isAmplitudeInited() {
  return inited;
}

function initOnce() {
  if (inited) return;
  if (typeof window === "undefined") return;
  inited = true;
  console.log("[Amplitude] initAll() called");
  amplitude.initAll("14542be394561e71412581eba013eddf", {
    analytics: {
      autocapture: {
        attribution: true,
        fileDownloads: true,
        formInteractions: true,
        pageViews: true,
        sessions: true,
        elementInteractions: true,
        networkTracking: true,
        webVitals: true,
        frustrationInteractions: {
          thrashedCursor: true,
          errorClicks: true,
          deadClicks: true,
          rageClicks: true,
        },
      },
    },
    sessionReplay: { sampleRate: 1 },
  });
}

/**
 * Amplitude init component. Only initializes the SDK once the user has
 * granted analytics consent via the cookie banner. Renders nothing.
 */
export const Amplitude = () => {
  const analytics = useConsentStore((s) => s.analytics);
  const hydrated = useConsentStore((s) => s.hydrated);

  useEffect(() => {
    console.log("[Amplitude] consent state", { hydrated, analytics, inited });
    if (hydrated && analytics) initOnce();
  }, [hydrated, analytics]);

  return null;
};

/**
 * Safe wrapper around `amplitude.track`. Logs every send and warns when
 * the SDK is not yet initialized (most commonly: user hasn't accepted
 * analytics cookies, so the event is dropped).
 */
export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!inited) {
    console.warn(
      `[Amplitude] track("${event}") dropped — SDK not initialized (analytics consent?)`,
      props,
    );
    return;
  }
  console.log(`[Amplitude] track("${event}")`, props);
  try {
    amplitude.track(event, props);
  } catch (err) {
    console.error(`[Amplitude] track("${event}") threw`, err);
  }
}

export default amplitude;
