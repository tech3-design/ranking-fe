"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getGAProperties,
  selectGAProperty,
  syncGAData,
  type GA4Property,
} from "@/lib/api/integrations";

interface GAPropertySelectorProps {
  email: string;
  onPropertySelected: () => void;
}

export function GAPropertySelector({
  email,
  onPropertySelected,
}: GAPropertySelectorProps) {
  const [properties, setProperties] = useState<GA4Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    getGAProperties(email)
      .then(({ properties: props }) => setProperties(props))
      .catch((err) => {
        setError(
          err?.response?.data?.error || "Failed to load GA4 properties.",
        );
      })
      .finally(() => setLoading(false));
  }, [email]);

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    setError(null);

    const selected = properties.find((p) => p.property_id === selectedId);
    try {
      await selectGAProperty(
        email,
        selectedId,
        selected?.display_name ?? "",
      );
      // Trigger initial data sync
      await syncGAData(email).catch(() => {});
      onPropertySelected();
    } catch {
      setError("Failed to save property selection.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading GA4 properties...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No GA4 properties found for this account.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Select a GA4 property</label>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Choose a property...</option>
        {properties.map((p) => (
          <option key={p.property_id} value={p.property_id}>
            {p.display_name} ({p.account_name})
          </option>
        ))}
      </select>
      <Button
        onClick={handleSave}
        disabled={!selectedId || saving}
        size="sm"
      >
        {saving ? "Saving..." : "Save & Sync Data"}
      </Button>
    </div>
  );
}
