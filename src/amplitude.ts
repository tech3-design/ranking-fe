"use client";

import * as amplitude from "@amplitude/unified";

function initAmplitude() {
  if (typeof window !== "undefined") {
    amplitude.initAll("9c3b450cf48a3c4ad11a7799efd9d7c6", {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
  }
}

initAmplitude();

export const Amplitude = () => null;
export default amplitude;
