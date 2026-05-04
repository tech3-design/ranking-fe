"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, Clock, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

function buildTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const value = `${hh}:${mm}`;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayH}:${mm} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions();

function defaultTime(): string {
  const d = new Date(Date.now() + 30 * 60_000);
  const mins = Math.ceil(d.getMinutes() / 15) * 15;
  d.setMinutes(mins % 60, 0, 0);
  if (mins === 60) d.setHours(d.getHours() + 1);
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(defaultTime());
  const [frequency, setFrequency] = useState<ScheduleFrequency>("once");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(new Date());
      setTime(defaultTime());
      setFrequency("once");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const runAtIso = useMemo(() => {
    if (!date || !time) return null;
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }, [date, time]);

  const isFuture = runAtIso ? new Date(runAtIso) > new Date() : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!runAtIso) { setError("Pick a valid date and time."); return; }
    if (!isFuture) { setError("Scheduled time must be in the future."); return; }
    if (!url) { setError("Project URL is missing — can't schedule."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await toggleSchedule({ email, org_id: orgId, url, brand_name: brandName, frequency, is_active: true, run_at: runAtIso });
      onScheduled?.();
      onClose();
    } catch {
      setError("Couldn't schedule. Check your inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const humanFreq =
    frequency === "once" ? "one time" :
    frequency === "weekly" ? "every week from this moment" :
    "every month from this moment";

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const dialogMarkup = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-analysis-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <h2 id="schedule-analysis-title" className="text-base font-semibold text-foreground">
                Schedule analysis
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              We'll run a fresh analysis of{" "}
              <span className="font-medium text-foreground">{url}</span>{" "}
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
          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Date picker */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start gap-2 border-border/80 bg-white px-3 text-left text-sm font-normal shadow-sm hover:bg-neutral-50",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    {date ? format(date, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="z-[300] w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={{ before: new Date() }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time picker */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Time</span>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-9 w-full border-border/80 bg-white text-sm shadow-sm focus:ring-0 focus:border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[300] max-h-60">
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Frequency</span>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as ScheduleFrequency)}>
              <SelectTrigger className="h-9 w-full border-border/80 bg-white text-sm shadow-sm focus:ring-0 focus:border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                <SelectItem value="once">Once, at the chosen time</SelectItem>
                <SelectItem value="weekly">Weekly, starting then</SelectItem>
                <SelectItem value="monthly">Monthly, starting then</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
