import confetti from "canvas-confetti";

const CORAL = "#F95C4B";

/**
 * Fire a celebration confetti burst — coral + gold + white.
 * Call after analysis completes or re-analysis finishes.
 */
export function fireConfetti() {
  const defaults = {
    spread: 360,
    ticks: 80,
    gravity: 0.8,
    decay: 0.92,
    startVelocity: 25,
    colors: [CORAL, "#FF7A6B", "#FFD700", "#FFFFFF", "#F5EDE4"],
  };

  // Center burst
  confetti({
    ...defaults,
    particleCount: 50,
    scalar: 1.2,
    shapes: ["circle", "square"],
    origin: { x: 0.5, y: 0.4 },
  });

  // Left side
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      scalar: 0.9,
      origin: { x: 0.3, y: 0.5 },
    });
  }, 150);

  // Right side
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      scalar: 0.9,
      origin: { x: 0.7, y: 0.5 },
    });
  }, 300);
}

/**
 * Fire a subtle side-cannon confetti for smaller wins (e.g. fix applied).
 */
export function fireSmallConfetti() {
  confetti({
    particleCount: 25,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: [CORAL, "#FFD700", "#FFFFFF"],
  });
  confetti({
    particleCount: 25,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: [CORAL, "#FFD700", "#FFFFFF"],
  });
}
