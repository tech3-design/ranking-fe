"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

export function DashboardTopBarUserMenu() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined;

  const basePath = `/dashboard/${slug}`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      {open ? (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-1 min-w-[220px] rounded-md border border-border bg-card p-2.5 shadow-lg ring-1 ring-black/5",
            "dark:ring-white/10",
          )}
        >
          <div className="mb-2 flex items-center gap-3 border-b border-border px-1 pb-2.5">
            <UserAvatar src={userImage} initials={userInitials} size={36} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">{userName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <Link
              href={`${basePath}/settings/profile`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Settings className="size-3.5 shrink-0" aria-hidden />
              Settings
            </Link>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-muted"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar src={userImage} initials={userInitials} size={30} />
        <span className="hidden max-w-[120px] truncate text-left text-[13px] font-medium text-foreground sm:inline">
          {userName}
        </span>
        {open ? (
          <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>
    </div>
  );
}
