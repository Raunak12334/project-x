import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  href?: string;
  imageSize?: number;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

export function BrandLockup({
  href = "/",
  imageSize = 28,
  className,
  imageClassName,
  textClassName,
}: BrandLockupProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.svg"
        alt="Otogent"
        width={imageSize}
        height={imageSize}
        className={cn("shrink-0 drop-shadow-sm", imageClassName)}
      />
      <span
        className={cn(
          "text-xl font-semibold tracking-tight text-foreground",
          textClassName,
        )}
      >
        Otogent
      </span>
    </Link>
  );
}
