"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  getSchedule,
  toggleSchedule,
  type ScheduledAnalysis,
} from "@/lib/api/analyzer";
import { CalendarClock, Loader2 } from "lucide-react";

interface ScheduleToggleProps {
  email: string;
  orgId: number;
  url: string;
  brandName?: string;
}

export function ScheduleToggle({ email, orgId, url, brandName }: ScheduleToggleProps) {
  const [schedule, setSchedule] = useState<ScheduledAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    if (!email || !orgId) return;
    getSchedule(email, orgId)
      .then((s) => {
        if (s) {
          setSchedule(s);
          setFrequency(s.frequency);
        }
      })
      .catch(() => {});
  }, [email, orgId]);

  async function handleToggle() {
    setLoading(true);
    try {
      const newActive = !schedule?.is_active;
      const result = await toggleSchedule({
        email,
        org_id: orgId,
        url,
        brand_name: brandName,
        frequency,
        is_active: newActive === undefined ? true : newActive,
      });
      setSchedule(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleFrequencyChange(f: "weekly" | "monthly") {
    setFrequency(f);
    if (!schedule?.is_active) return;
    setLoading(true);
    try {
      const result = await toggleSchedule({
        email,
        org_id: orgId,
        url,
        brand_name: brandName,
        frequency: f,
        is_active: true,
      });
      setSchedule(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const isActive = schedule?.is_active ?? false;

  return (
    <div className="flex items-center gap-2">
      {isActive && (
        <select
          value={frequency}
          onChange={(e) => handleFrequencyChange(e.target.value as "weekly" | "monthly")}
          className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs"
          disabled={loading}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      )}
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={loading}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CalendarClock className="h-3.5 w-3.5" />
        )}
        {isActive ? "Scheduled" : "Auto Re-analyze"}
      </Button>
    </div>
  );
}
