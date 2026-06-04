"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

type ScrollStage = {
  enter: number;
  hold: number;
  exit: number;
  presence: number;
};

type TechItem = {
  slug: string;
  name: string;
  color: string;
};

const TECH_STACK: TechItem[] = [
  { slug: "react", name: "React", color: "#61DAFB" },
  { slug: "nextdotjs", name: "Next.js", color: "#000000" },
  { slug: "typescript", name: "TypeScript", color: "#3178C6" },
  { slug: "tailwindcss", name: "Tailwind", color: "#06B6D4" },
  { slug: "nodedotjs", name: "Node.js", color: "#5FA04E" },
  { slug: "firebase", name: "Firebase", color: "#FFCA28" },
  { slug: "git", name: "Git", color: "#F05032" },
  { slug: "docker", name: "Docker", color: "#2496ED" },
  { slug: "vercel", name: "Vercel", color: "#000000" },
  { slug: "postgresql", name: "Postgres", color: "#4169E1" },
  { slug: "figma", name: "Figma", color: "#F24E1E" },
  { slug: "github", name: "GitHub", color: "#181717" }
];

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  const v = cleaned.length === 3
    ? cleaned.split("").map((c) => c + c).join("")
    : cleaned.padEnd(6, "0");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function DevStackScroll({ stage }: { stage: ScrollStage }) {
  const visible = stage.presence > 0.18 && stage.exit < 0.82;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasEnteredRef = useRef(false);
  const ambientStartedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>("[data-stack-card]");
    if (cards.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (visible && !hasEnteredRef.current) {
      hasEnteredRef.current = true;

      animate(cards, {
        translateY: [40, 0],
        opacity: [0, 1],
        scale: [0.86, 1],
        rotate: [-3, 0],
        delay: stagger(55),
        duration: reduce ? 0 : 720,
        ease: "outElastic(1, 0.85)",
        onComplete: () => {
          if (ambientStartedRef.current || reduce) return;
          ambientStartedRef.current = true;
          animate(cards, {
            translateY: [0, -4, 0],
            duration: 3800,
            delay: stagger(160, { from: "center" }),
            ease: "inOutSine",
            loop: true
          });
        }
      });
    } else if (!visible && hasEnteredRef.current) {
      hasEnteredRef.current = false;
      ambientStartedRef.current = false;
      animate(cards, {
        translateY: 40,
        opacity: 0,
        scale: 0.9,
        duration: reduce ? 0 : 360,
        ease: "outQuad"
      });
    }
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 grid place-items-center pointer-events-auto px-6"
      dir="ltr"
    >
      <div className="grid w-full max-w-[680px] grid-cols-4 gap-3 sm:gap-4">
        {TECH_STACK.map((tech) => (
          <div
            key={tech.slug}
            data-stack-card
            style={{
              opacity: 0,
              willChange: "opacity, transform"
            }}
          >
            <div
              className="dev-stack-card group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-[#142111]/12 bg-white p-3 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.05] hover:border-[#142111]/24 sm:gap-2.5 sm:p-4"
              style={{
                boxShadow: "0 8px 22px rgba(20,33,17,0.06)"
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${hexToRgba(tech.color, 0.18)} 0%, transparent 70%)`
                }}
              />
              <div
                className="absolute -inset-1 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `0 18px 38px ${hexToRgba(tech.color, 0.28)}`,
                  pointerEvents: "none"
                }}
              />
              <div className="relative h-8 w-8 transition-transform duration-300 ease-out group-hover:scale-110 sm:h-10 sm:w-10">
                <img
                  src={`https://cdn.simpleicons.org/${tech.slug}`}
                  alt={tech.name}
                  width={40}
                  height={40}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>
              <span className="relative text-[10px] font-semibold tracking-[0.04em] text-[#142111]/80 sm:text-[11px]">
                {tech.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DevStackScroll;
