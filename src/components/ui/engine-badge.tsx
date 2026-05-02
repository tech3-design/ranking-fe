import Image from "next/image";
import { engineLabel, engineLogo } from "@/lib/engines";
import { cn } from "@/lib/utils";

interface EngineBadgeProps {
  engine: string;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export function EngineBadge({
  engine,
  size = 16,
  showLabel = true,
  className,
}: EngineBadgeProps) {
  const src = engineLogo(engine);
  const label = engineLabel(engine);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {src ? (
        <Image
          src={src}
          alt={label}
          width={size}
          height={size}
          className="rounded-sm"
          unoptimized
        />
      ) : (
        <span
          className="inline-flex items-center justify-center rounded-sm bg-muted text-[10px] font-semibold text-muted-foreground"
          style={{ width: size, height: size }}
        >
          {label.slice(0, 1)}
        </span>
      )}
      {showLabel && <span>{label}</span>}
    </span>
  );
}
