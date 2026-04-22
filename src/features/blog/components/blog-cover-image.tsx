import Image from "next/image";
import { cn } from "@/lib/utils";

type BlogCoverImageProps = {
  src: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export function BlogCoverImage({
  src,
  alt = "",
  priority,
  sizes = "100vw",
  className,
}: BlogCoverImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn("h-full w-full object-cover", className)}
      sizes={sizes}
      priority={priority}
      unoptimized={!src.startsWith("/")}
    />
  );
}
