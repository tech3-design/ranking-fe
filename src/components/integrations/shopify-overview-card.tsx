"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShopifyDataSnapshot } from "@/lib/api/integrations";

interface ShopifyOverviewCardProps {
  data: ShopifyDataSnapshot;
}

export function ShopifyOverviewCard({ data }: ShopifyOverviewCardProps) {
  const metrics = [
    { label: "Total Orders", value: data.total_orders.toLocaleString() },
    {
      label: "Revenue",
      value: `$${parseFloat(data.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      label: "Avg Order Value",
      value: `$${parseFloat(data.average_order_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    { label: "Customers", value: data.total_customers.toLocaleString() },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">E-commerce Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {data.date_start} &mdash; {data.date_end}
        </p>
      </CardContent>
    </Card>
  );
}
