import { cn } from "@/lib/utils";

type OnboardingStepperProps = {
  /** 1-based index of the furthest step reached (matches “Step n/total” in the header). */
  current: number;
  total: number;
  className?: string;
};

/**
 * Horizontal segment stepper for the multi-step onboarding wizard.
 */
export function OnboardingStepper({ current, total, className }: OnboardingStepperProps) {
  const safeTotal = Math.max(1, total);
  const clamped = Math.min(Math.max(1, current), safeTotal);

  return (
    <div
      className={cn("flex items-center justify-center gap-1.5", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={1}
      aria-valuemax={safeTotal}
      aria-label={`Onboarding step ${clamped} of ${safeTotal}`}
    >
      {Array.from({ length: safeTotal }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-[3px] rounded-full transition-[width,background-color] duration-300 ease-out",
            i < clamped ? "w-8 bg-foreground" : "w-4 bg-foreground/12",
          )}
        />
      ))}
    </div>
  );
}
