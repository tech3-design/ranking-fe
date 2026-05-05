"use client";

import { useState } from "react";
import { Globe2, Loader2 } from "lucide-react";
import type { PreviewElement } from "@/lib/api/content-optimisation";
import { cn } from "@/lib/utils";

type Props = {
  /** JPEG data URL of the rendered page (full-page screenshot from BE Playwright). */
  previewImage: string;
  /** Bounding boxes for clickable text elements, coords in CSS pixels at viewportWidth. */
  previewElements: PreviewElement[];
  /** CSS-pixel width the screenshot was taken at (1440 by default). */
  viewportWidth: number;
  isLoading: boolean;
  emptyMessage?: string;
  selectedElementId: number | null;
  onSelectElement: (el: PreviewElement | null) => void;
};

export function PageIframe({
  previewImage,
  previewElements,
  viewportWidth,
  isLoading,
  emptyMessage,
  selectedElementId,
  onSelectElement,
}: Props) {
  const [hoverId, setHoverId] = useState<number | null>(null);
  // Natural image height in CSS px — we need it to position bboxes vertically
  // as a percentage of the image's intrinsic height. Captured on image load.
  const [imgNaturalHeight, setImgNaturalHeight] = useState(0);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/15">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!previewImage) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/15 px-8 text-center">
        <Globe2 className="size-7 text-muted-foreground/60" />
        <p className="text-[13px] text-muted-foreground">
          {emptyMessage || "Enter a URL to load a page."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-auto bg-background">
      <div className="relative w-full">
        <img
          src={previewImage}
          alt="Page preview"
          className="block w-full h-auto select-none"
          draggable={false}
          onLoad={(e) => setImgNaturalHeight(e.currentTarget.naturalHeight)}
          onClick={() => onSelectElement(null)}
        />
        {/* Overlay layer fills the image's rendered box. We position each
            element's hit-zone with percentages so it scales correctly when
            the panel is resized — left/width relative to viewportWidth (the
            screenshot's intrinsic width), top/height relative to the image's
            intrinsic height. */}
        {imgNaturalHeight > 0 ? (
          <div className="absolute inset-0">
            {previewElements.map((el) => {
              const isSelected = el.id === selectedElementId;
              const isHover = el.id === hoverId;
              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(el);
                  }}
                  onMouseEnter={() => setHoverId(el.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className={cn(
                    "absolute cursor-pointer transition-colors",
                    isSelected
                      ? "border-2 border-primary bg-primary/10"
                      : isHover
                      ? "border-2 border-primary/60 bg-primary/5"
                      : "border border-transparent hover:border-primary/40",
                  )}
                  style={{
                    left: `${(el.bbox.x / viewportWidth) * 100}%`,
                    top: `${(el.bbox.y / imgNaturalHeight) * 100}%`,
                    width: `${(el.bbox.w / viewportWidth) * 100}%`,
                    height: `${(el.bbox.h / imgNaturalHeight) * 100}%`,
                  }}
                  title={`${el.tag.toUpperCase()}: ${el.text.slice(0, 80)}`}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
