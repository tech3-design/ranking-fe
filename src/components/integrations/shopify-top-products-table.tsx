"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShopifyDataSnapshot } from "@/lib/api/integrations";

interface ShopifyTopProductsTableProps {
  data: ShopifyDataSnapshot;
}

export function ShopifyTopProductsTable({ data }: ShopifyTopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium text-right">Qty Sold</th>
                <th className="pb-2 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((product) => (
                <tr key={product.product_id} className="border-b border-border/50">
                  <td className="py-2 truncate max-w-[300px]" title={product.title}>
                    {product.title}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {product.quantity_sold.toLocaleString()}
                  </td>
                  <td className="py-2 text-right font-mono">
                    ${parseFloat(product.revenue).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
              {data.top_products.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-4 text-center text-muted-foreground"
                  >
                    No product data available.
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
