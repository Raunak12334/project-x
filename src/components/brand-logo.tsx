"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackSrc?: string;
};

export function BrandLogo({
  src,
  alt,
  className,
  imageClassName,
  fallbackSrc = "/logos/composio.svg",
}: BrandLogoProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      {/* biome-ignore lint/performance/noImgElement: Remote SVG brand icons should render directly instead of going through Next image optimization. */}
      <img
        src={currentSrc}
        alt={alt}
        className={cn("h-full w-full object-contain", imageClassName)}
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
        }}
      />
    </div>
  );
}
