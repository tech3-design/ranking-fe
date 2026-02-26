import { create } from "zustand";

export type OnboardingStep =
  | "auth-method"
  | "otp-verify"
  | "company-info"
  | "complete";

export type AuthMode = "sign-up" | "sign-in";

interface OnboardingState {
  step: OnboardingStep;
  authMode: AuthMode;
  email: string;
  companyName: string;
  companyUrl: string;
}

interface OnboardingActions {
  setStep: (step: OnboardingStep) => void;
  setAuthMode: (mode: AuthMode) => void;
  setEmail: (email: string) => void;
  setCompanyInfo: (name: string, url: string) => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  step: "auth-method",
  authMode: "sign-up",
  email: "",
  companyName: "",
  companyUrl: "",
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>(
  (set) => ({
    ...initialState,
    setStep: (step) => set({ step }),
    setAuthMode: (mode) => set({ authMode: mode }),
    setEmail: (email) => set({ email }),
    setCompanyInfo: (name, url) => set({ companyName: name, companyUrl: url }),
    reset: () => set(initialState),
  }),
);
