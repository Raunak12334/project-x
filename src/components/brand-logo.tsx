"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  candidates?: string[];
  fallbackSrc?: string;
};

export function BrandLogo({
  src,
  alt,
  className,
  imageClassName,
  candidates,
  fallbackSrc = "/icon.png",
}: BrandLogoProps) {
  const logoCandidates = useMemo(
    () =>
      [src || "", ...(candidates || []), fallbackSrc].filter(
        (candidate, index, array) =>
          Boolean(candidate) && array.indexOf(candidate) === index,
      ),
    [src, candidates, fallbackSrc],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSrc = logoCandidates[currentIndex] || fallbackSrc;

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
          setCurrentIndex((index) =>
            index + 1 < logoCandidates.length ? index + 1 : index,
          );
        }}
      />
    </div>
  );
}
