"use client";

import type { CSSProperties, ReactNode } from "react";

type TextAnimateProps = {
  children: string;
  animation?: "blurInUp" | "fadeIn" | "scaleUp";
  by?: "word" | "character" | "text";
  className?: string;
};

export function TextAnimate({
  children,
  animation = "blurInUp",
  by = "word",
  className = ""
}: TextAnimateProps) {
  const parts =
    by === "text"
      ? [children]
      : by === "character"
        ? Array.from(children)
        : children.split(/(\s+)/);

  if (by === "text") {
    return (
      <span className={`text-animate text-animate--${animation} ${className}`}>
        <span className="text-animate-part" style={{ "--text-animate-index": 0 } as CSSProperties}>
          {children}
        </span>
      </span>
    );
  }

  return (
    <span className={`text-animate text-animate--${animation} ${className}`}>
      {parts.map((part, index) => {
        const isSpace = /^\s+$/.test(part);
        const content: ReactNode = isSpace ? part : <span className="text-animate-inner">{part}</span>;

        return (
          <span
            className={isSpace ? "text-animate-space" : "text-animate-part"}
            key={`${part}-${index}`}
            style={{ "--text-animate-index": index } as CSSProperties}
          >
            {content}
          </span>
        );
      })}
    </span>
  );
}
