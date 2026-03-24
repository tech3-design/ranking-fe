"use client";

import { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  initials: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ src, initials, size = 36, className = "" }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={`rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={src}
          alt="avatar"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="font-semibold text-muted-foreground select-none"
          style={{ fontSize: size * 0.35 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
