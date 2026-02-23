"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GADataSnapshot } from "@/lib/api/integrations";

interface TopPagesTableProps {
  data: GADataSnapshot;
}

export function TopPagesTable({ data }: TopPagesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Page</th>
                <th className="pb-2 font-medium text-right">Sessions</th>
                <th className="pb-2 font-medium text-right">Bounce Rate</th>
                <th className="pb-2 font-medium text-right">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.top_pages.map((page) => (
                <tr key={page.path} className="border-b border-border/50">
                  <td className="py-2 truncate max-w-[300px]" title={page.path}>
                    {page.path}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {page.sessions.toLocaleString()}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {Math.round(page.bounce_rate * 100)}%
                  </td>
                  <td className="py-2 text-right font-mono">
                    {Math.floor(page.avg_duration / 60)}m{" "}
                    {Math.round(page.avg_duration % 60)}s
                  </td>
                </tr>
              ))}
              {data.top_pages.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-muted-foreground"
                  >
                    No page data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
