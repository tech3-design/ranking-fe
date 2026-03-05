import { create } from "zustand";
import type { Organization } from "@/lib/api/organizations";

const STORAGE_KEY = "activeOrgId";

interface OrgStore {
  organizations: Organization[];
  activeOrg: Organization | null;
  setOrganizations: (orgs: Organization[]) => void;
  setActiveOrg: (org: Organization) => void;
}

export const useOrgStore = create<OrgStore>((set) => ({
  organizations: [],
  activeOrg: null,

  setOrganizations: (orgs) => {
    set((state) => {
      const storedId =
        typeof window !== "undefined"
          ? Number(localStorage.getItem(STORAGE_KEY))
          : null;
      const restored =
        storedId ? orgs.find((o) => o.id === storedId) ?? orgs[0] : orgs[0];
      // Keep activeOrg if it's still in the new list
      const current = state.activeOrg;
      const activeOrg =
        current && orgs.some((o) => o.id === current.id)
          ? current
          : (restored ?? null);
      return { organizations: orgs, activeOrg };
    });
  },

  setActiveOrg: (org) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(org.id));
    }
    set({ activeOrg: org });
  },
}));
