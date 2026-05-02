"use client";

import { SignalorRings } from "./signalor-rings";

interface SignalorLoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

/**
 * SignalorLoader — global loading visual.
 *
 * Rings are the current default. Once `@rive-app/react-canvas` is installed
 * and a Rive file lives at `/public/animations/loading.riv`, this component
 * will be upgraded to auto-play that animation with rings as fallback.
 */
export function SignalorLoader({ size = "md", label }: SignalorLoaderProps) {
  return <SignalorRings size={size} label={label} />;
}
