"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";

interface PDFDownloadButtonProps {
  runId: number;
}

export function PDFDownloadButton({ runId }: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleDownload() {
    setLoading(true);
    setStatus("idle");
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/analyzer/runs/${runId}/export-pdf/`,
        { method: "POST" },
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `geo-analysis-${runId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      alert("Failed to download PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="h-9 min-w-36 gap-2 rounded-full border-primary/25 bg-primary/10 px-4 text-primary transition-colors hover:bg-primary/15 hover:text-primary"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Generating PDF...
        </>
      ) : status === "success" ? (
        <>
          <CheckCircle2 className="size-4" />
          Downloaded
        </>
      ) : (
        <>
          <Download className="size-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}
