"use client";

import { SignalorRings } from "./signalor-rings";

/**
 * RiveLoader — placeholder until @rive-app/react-canvas is installed.
 *
 * Currently just renders the SignalorRings visual. Once the Rive package
 * is on disk (see install task) this will be swapped back to play a
 * .riv animation from /public/animations/loading.riv.
 */
interface RiveLoaderProps {
  src?: string;
  size?: number;
  label?: string;
  className?: string;
  stateMachine?: string;
}

export function RiveLoader({ label, className }: RiveLoaderProps) {
  return (
    <div className={className}>
      <SignalorRings size="lg" />
      {label ? (
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          {label}
        </p>
      ) : null}
    </div>
  );
}
