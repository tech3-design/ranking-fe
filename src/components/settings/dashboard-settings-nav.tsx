"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface DashboardSettingsNavProps {
  label: string;
}

export function DashboardSettingsNav({ label }: DashboardSettingsNavProps) {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
      <Link
        href={`/dashboard/${slug}`}
        className="transition-colors hover:text-foreground"
      >
        Settings
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      <span className="text-foreground">{label}</span>
    </div>
  );
}
