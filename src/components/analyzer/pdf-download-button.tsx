"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";

interface PDFDownloadButtonProps {
  runId: number;
}

export function PDFDownloadButton({ runId }: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
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
    } catch {
      alert("Failed to download PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
      {loading ? "Generating..." : "Download PDF"}
    </Button>
  );
}
