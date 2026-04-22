import type React from "react";
import { cn } from "@/lib/utils";

type BlogContentProps = {
  content: string;
  className?: string;
};

function formatInline(text: string) {
  return text.replace(/\*\*/g, "");
}

export function BlogContent({ content, className }: BlogContentProps) {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let blockCount = 0;

  const nextKey = (prefix: string) => {
    blockCount += 1;
    return `${prefix}-${blockCount}`;
  };

  const flushList = () => {
    if (listItems.length === 0) return;

    blocks.push(
      <ul
        key={nextKey("list")}
        className="my-6 list-disc space-y-2 pl-6 text-muted-foreground"
      >
        {listItems.map((item) => (
          <li key={item}>{formatInline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2).trim());
      return;
    }

    flushList();

    if (line.startsWith("### ")) {
      blocks.push(
        <h3
          key={nextKey("h3")}
          className="mt-9 mb-3 text-2xl font-bold tracking-tight"
        >
          {formatInline(line.slice(4))}
        </h3>,
      );
      return;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={nextKey("h2")}
          className="mt-12 mb-4 text-3xl font-black tracking-tight"
        >
          {formatInline(line.slice(3))}
        </h2>,
      );
      return;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h2
          key={nextKey("h1")}
          className="mt-12 mb-4 text-3xl font-black tracking-tight"
        >
          {formatInline(line.slice(2))}
        </h2>,
      );
      return;
    }

    blocks.push(
      <p
        key={nextKey("p")}
        className="my-5 text-lg leading-8 text-muted-foreground"
      >
        {formatInline(line)}
      </p>,
    );
  });

  flushList();

  return <div className={cn("max-w-none", className)}>{blocks}</div>;
}
