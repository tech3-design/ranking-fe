import { create } from "zustand";

/**
 * Cookie consent store.
 *
 * Source of truth for which non-essential trackers (Amplitude, Clarity, GA)
 * are allowed to fire. Persists the user's choice to localStorage so the
 * banner only shows on first visit + lets users open Preferences from the
 * footer to change their mind later.
 *
 * `decidedAt === null` means the banner is still pending — no analytics
 * tracker should run until the user has either Accepted or Rejected.
 */

const STORAGE_KEY = "signalor-consent-v1";

export interface ConsentState {
  necessary: true; // always true, can't be toggled
  analytics: boolean; // Amplitude, Clarity, Google Analytics
  marketing: boolean; // ad pixels, retargeting (none today, future-proofing)
  decidedAt: string | null; // ISO timestamp of the user's choice
}

interface ConsentStore extends ConsentState {
  /** True once the store has read localStorage (avoid flicker on first render). */
  hydrated: boolean;

  /** Run on the client at app start to load persisted choice. */
  hydrate: () => void;

  /** Accept everything. */
  acceptAll: () => void;

  /** Reject everything optional (keeps `necessary: true`). */
  rejectAll: () => void;

  /** Wipe the saved choice — the banner will reappear on next render. */
  reset: () => void;
}

const defaultState: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
};

function readFromStorage(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : null,
    };
  } catch {
    return null;
  }
}

function writeToStorage(state: ConsentState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded or storage disabled — no-op */
  }
}

export const useConsentStore = create<ConsentStore>((set) => ({
  ...defaultState,
  hydrated: false,

  hydrate: () => {
    const stored = readFromStorage();
    if (stored) {
      set({ ...stored, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  acceptAll: () => {
    const next: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    };
    writeToStorage(next);
    set(next);
  },

  rejectAll: () => {
    const next: ConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    };
    writeToStorage(next);
    set(next);
  },

  reset: () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* no-op */
      }
    }
    set({ ...defaultState });
  },
}));

/** True when the user has explicitly Accepted or Rejected (banner can hide). */
export function hasDecidedConsent(state: ConsentState): boolean {
  return state.decidedAt !== null;
}
