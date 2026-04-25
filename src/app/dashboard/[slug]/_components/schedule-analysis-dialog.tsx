"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleSchedule, type ScheduleFrequency } from "@/lib/api/analyzer";

interface ScheduleAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  orgId: number;
  url: string;
  brandName: string;
  onScheduled?: () => void;
}

function todayYMD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function defaultTime(): string {
  // 30 minutes from now, rounded to next 15 minutes
  const d = new Date(Date.now() + 30 * 60_000);
  const mins = Math.ceil(d.getMinutes() / 15) * 15;
  d.setMinutes(mins, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ScheduleAnalysisDialog({
  open,
  onClose,
  email,
  orgId,
  url,
  brandName,
  onScheduled,
}: ScheduleAnalysisDialogProps) {
  const [date, setDate] = useState(todayYMD());
  const [time, setTime] = useState(defaultTime());
  const [frequency, setFrequency] = useState<ScheduleFrequency>("once");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(todayYMD());
      setTime(defaultTime());
      setFrequency("once");
      setError(null);
    }
  }, [open]);

  // Lock body scroll while dialog is open; restore on close / unmount
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const runAtIso = useMemo(() => {
    if (!date || !time) return null;
    const d = new Date(`${date}T${time}:00`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }, [date, time]);

  const isFuture = runAtIso ? new Date(runAtIso) > new Date() : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!runAtIso) {
      setError("Pick a valid date and time.");
      return;
    }
    if (!isFuture) {
      setError("Scheduled time must be in the future.");
      return;
    }
    if (!url) {
      setError("Project URL is missing — can't schedule.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await toggleSchedule({
        email,
        org_id: orgId,
        url,
        brand_name: brandName,
        frequency,
        is_active: true,
        run_at: runAtIso,
      });
      onScheduled?.();
      onClose();
    } catch {
      setError("Couldn't schedule. Check your inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const humanFreq =
    frequency === "once"
      ? "one time"
      : frequency === "weekly"
        ? "every week from this moment"
        : "every month from this moment";

  const dialogMarkup = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-analysis-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 id="schedule-analysis-title" className="text-base font-semibold text-foreground">
                Schedule analysis
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              We'll run a fresh analysis of <span className="font-medium text-foreground">{url}</span>{" "}
              {humanFreq}.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Date
              <Input
                type="date"
                required
                min={todayYMD()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Time
              <Input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 text-sm"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Frequency
            <Select value={frequency} onValueChange={(v) => setFrequency(v as ScheduleFrequency)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once, at the chosen time</SelectItem>
                <SelectItem value="weekly">Weekly, starting then</SelectItem>
                <SelectItem value="monthly">Monthly, starting then</SelectItem>
              </SelectContent>
            </Select>
          </label>

          {runAtIso && isFuture ? (
            <p className="text-[11px] text-muted-foreground">
              Runs: {new Date(runAtIso).toLocaleString()}
            </p>
          ) : null}

          {error ? (
            <p className="text-[12px] text-red-600">{error}</p>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting || !isFuture}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Scheduling…
              </>
            ) : (
              "Schedule"
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  return createPortal(dialogMarkup, document.body);
}
