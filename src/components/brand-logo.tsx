"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({
  src,
  alt,
  className,
  imageClassName,
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="32px"
        className={cn("object-contain", imageClassName)}
      />
    </div>
  );
}
