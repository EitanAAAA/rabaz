"use client";

import { memo, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Wifi, Battery, Bell, Search, Home, MessageCircle, Bookmark, User, BarChart3, Music, Heart } from "lucide-react";

type Stage = {
  enter: number;
  hold: number;
  exit: number;
  presence: number;
};

interface AppShowcasePhoneProps {
  stage: Stage;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (v: number) => 1 - Math.pow(1 - v, 2.5);

export function AppShowcasePhone({ stage }: AppShowcasePhoneProps) {
  const visible = stage.presence > 0.18 && stage.exit < 0.82;
  const sideProgress = clamp01((stage.hold - 0.08) / 0.55);

  if (stage.presence < 0.005) return null;

  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-auto px-5 py-3 sm:py-5" dir="ltr">
      <div
        className="relative flex w-full items-center justify-center"
        style={{
          maxWidth: "780px",
          height: "min(76vh, 520px)",
          transition: "opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)"
        }}
      >
        <SidePhone side="left" progress={sideProgress} theme="cyan" />
        <SidePhone side="right" progress={sideProgress} theme="yellow" />
        <CenterPhone />
      </div>
    </div>
  );
}

const CenterPhone = memo(function CenterPhone() {
  return (
    <div
      className="relative z-20"
      style={{
        width: "238px",
        height: "476px"
      }}
    >
      <div className="absolute inset-0 rounded-[44px] bg-zinc-950 shadow-[0_40px_90px_rgba(15,23,42,0.25)]">
        <div className="relative h-full w-full overflow-hidden rounded-[40px] border-[5px] border-zinc-950 bg-white">
          <div className="absolute left-1/2 top-0 z-50 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-zinc-950" />

          <div className="relative z-40 flex w-full items-center justify-between px-5 pt-3.5 text-zinc-900">
            <span className="font-sans text-[11px] font-bold tracking-tight">9:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3" />
              <span className="font-mono text-[8px] font-bold">5G</span>
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          <MonochromeApp />
        </div>
      </div>
    </div>
  );
});

const MonochromeApp = memo(function MonochromeApp() {
  const appRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = appRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const line = root.querySelector<SVGPathElement>("[data-mono-line]");
    const dots = root.querySelectorAll<SVGCircleElement>("[data-mono-dot]");
    const bars = root.querySelectorAll<HTMLDivElement>("[data-mono-bar]");
    const stat = root.querySelectorAll<HTMLDivElement>("[data-mono-stat]");

    const cleanups: Array<() => void> = [];

    if (line) {
      const length = 600;
      line.style.strokeDasharray = String(length);
      line.style.strokeDashoffset = String(length);
      const a = animate(line, {
        strokeDashoffset: [length, 0],
        duration: 2400,
        ease: "inOutCubic",
        loop: true,
        alternate: true
      });
      cleanups.push(() => a.pause());
    }

    if (dots.length) {
      dots.forEach((d) => {
        d.style.transformBox = "fill-box";
        d.style.transformOrigin = "center";
      });
      const a = animate(dots, {
        scale: [1, 1.55, 1],
        opacity: [0.55, 1, 0.55],
        duration: 2200,
        delay: stagger(220),
        ease: "inOutSine",
        loop: true
      });
      cleanups.push(() => a.pause());
    }

    if (bars.length) {
      bars.forEach((b) => {
        b.style.transformOrigin = "bottom";
      });
      const a = animate(bars, {
        scaleY: [0.78, 1.08, 0.78],
        duration: 1800,
        delay: stagger(140, { from: "center" }),
        ease: "inOutQuad",
        loop: true
      });
      cleanups.push(() => a.pause());
    }

    if (stat.length) {
      const a = animate(stat, {
        translateY: [10, 0],
        opacity: [0, 1],
        duration: 700,
        delay: stagger(120, { start: 200 }),
        ease: "outCubic"
      });
      cleanups.push(() => a.pause());
    }

    return () => {
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <div ref={appRef} className="relative flex flex-1 flex-col overflow-hidden px-4 pb-3 pt-3" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-zinc-900 ring-2 ring-white">
            <div className="absolute inset-0 grid place-items-center text-[12px] font-bold text-white">א</div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500">דשבורד יומי</span>
            <span className="text-[12px] font-bold text-zinc-900">אביעד</span>
          </div>
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-zinc-900" />
        </button>
      </div>

      <div className="mt-3 flex h-9 items-center gap-2 rounded-full bg-zinc-100 px-3.5">
        <Search className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-[10.5px] text-zinc-400">חיפוש דוחות, נתונים</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl bg-zinc-900 p-3.5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">השבוע</span>
            <span className="text-[14px] font-bold leading-tight">סקירת ביצועים</span>
          </div>
          <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wide text-white">
            +18%
          </span>
        </div>

        <div className="relative mt-2.5 h-[68px] w-full">
          <svg viewBox="0 0 240 80" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mono-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path
              d="M 0 60 L 30 50 L 60 56 L 90 38 L 120 44 L 150 28 L 180 32 L 210 18 L 240 24 L 240 80 L 0 80 Z"
              fill="url(#mono-fill)"
            />
            <path
              data-mono-line
              d="M 0 60 L 30 50 L 60 56 L 90 38 L 120 44 L 150 28 L 180 32 L 210 18 L 240 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[
              { x: 30, y: 50 },
              { x: 90, y: 38 },
              { x: 150, y: 28 },
              { x: 210, y: 18 }
            ].map((p, i) => (
              <circle
                key={i}
                data-mono-dot
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="white"
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {[
          { label: "פעולות", value: "12.4k", icon: BarChart3 },
          { label: "המרות", value: "8.3%", icon: Heart },
          { label: "פעילים", value: "97", icon: Music }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              data-mono-stat
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-2"
              style={{ opacity: 0, willChange: "opacity, transform" }}
            >
              <Icon className="mb-1 h-3 w-3 text-zinc-700" />
              <div className="text-[9px] font-semibold text-zinc-500">{stat.label}</div>
              <div className="text-[12px] font-bold leading-none text-zinc-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 rounded-2xl border border-zinc-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-900">פעילות שעתית</span>
          <span className="font-mono text-[9px] font-bold text-zinc-400">07-13</span>
        </div>
        <div className="flex h-[44px] items-end justify-between gap-1.5 px-0.5">
          {[42, 60, 38, 75, 55, 82, 48].map((h, i) => (
            <div
              key={i}
              data-mono-bar
              className="relative flex-1 rounded-t-sm bg-zinc-900"
              style={{
                height: `${h}%`
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-around rounded-2xl bg-white px-3 py-2 ring-1 ring-zinc-100">
        {[
          { icon: Home, active: true },
          { icon: BarChart3, active: false },
          { icon: Bookmark, active: false },
          { icon: User, active: false }
        ].map(({ icon: Icon, active }, i) => (
          <button
            key={i}
            className={`relative grid h-8 w-8 place-items-center ${active ? "text-zinc-900" : "text-zinc-400"}`}
          >
            <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 2} />
            {active ? (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-zinc-900" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
});

type SideTheme = "cyan" | "yellow";

const SidePhone = memo(function SidePhone({
  side,
  progress,
  theme
}: {
  side: "left" | "right";
  progress: number;
  theme: SideTheme;
}) {
  const isLeft = side === "left";
  const rootRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef(progress);
  const currentRef = useRef(progress);

  useEffect(() => {
    targetRef.current = progress;
  }, [progress]);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      currentRef.current += (targetRef.current - currentRef.current) * 0.14;
      const node = rootRef.current;
      if (node) {
        const eased = ease(clamp01(currentRef.current));
        const ox = isLeft ? lerp(-100, -168, eased) : lerp(100, 168, eased);
        const ty = (1 - eased) * 18;
        const sc = lerp(0.78, 0.86, eased);
        const tilt = isLeft ? 18 : -18;
        const opacity = clamp01(eased * 1.3);
        node.style.transform = `translateX(${ox.toFixed(2)}px) translateY(${ty.toFixed(2)}px) scale(${sc.toFixed(3)}) rotateY(${tilt}deg)`;
        node.style.opacity = opacity.toFixed(3);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [isLeft]);

  const themeStyles =
    theme === "cyan"
      ? {
          ring: "ring-[#22D3EE]/50",
          headerBg: "from-[#22D3EE] via-[#06B6D4] to-[#0891B2]",
          accent: "#0891B2",
          accentSoft: "#e0f7fb",
          chipColor: "text-[#0891B2]",
          dot: "bg-[#22D3EE]"
        }
      : {
          ring: "ring-[#FACC15]/55",
          headerBg: "from-[#E5A50A] via-[#CA8A04] to-[#9A6700]",
          accent: "#CA8A04",
          accentSoft: "#fef9c3",
          chipColor: "text-[#A16207]",
          dot: "bg-[#FACC15]"
        };

  return (
    <div
      ref={rootRef}
      className="absolute z-10"
      style={{
        width: "156px",
        height: "318px",
        opacity: 0,
        transformStyle: "preserve-3d",
        transformOrigin: "center",
        willChange: "transform, opacity"
      }}
      dir="ltr"
    >
      <div
        className={`absolute inset-0 rounded-[30px] bg-zinc-950 shadow-[0_24px_60px_rgba(15,23,42,0.28)] ring-2 ${themeStyles.ring}`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[26px] border-[4px] border-zinc-950 bg-white">
          <div className="absolute left-1/2 top-0 z-50 h-3.5 w-16 -translate-x-1/2 rounded-b-xl bg-zinc-950" />

          <div className="relative z-40 flex items-center justify-between px-3 pt-2.5">
            <span className="font-sans text-[8px] font-bold text-zinc-900">9:41</span>
            <div className="flex items-center gap-1 text-zinc-900">
              <Wifi className="h-2 w-2" />
              <Battery className="h-2.5 w-2.5" />
            </div>
          </div>

          <SideAppContent theme={theme} themeStyles={themeStyles} />
        </div>
      </div>
    </div>
  );
});

function SideAppContent({
  theme,
  themeStyles
}: {
  theme: SideTheme;
  themeStyles: {
    ring: string;
    headerBg: string;
    accent: string;
    accentSoft: string;
    chipColor: string;
    dot: string;
  };
}) {
  return (
    <div className="flex h-[calc(100%-26px)] flex-col px-2.5 pb-2.5 pt-2" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${themeStyles.headerBg}`} />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 leading-none">{theme === "cyan" ? "Music" : "Chat"}</span>
            <span className="text-[8.5px] font-bold leading-tight text-zinc-900">
              {theme === "cyan" ? "פלייליסט" : "הודעות"}
            </span>
          </div>
        </div>
        <span className={`h-1.5 w-1.5 rounded-full ${themeStyles.dot} animate-pulse`} />
      </div>

      <div
        className={`mt-2 overflow-hidden rounded-xl bg-gradient-to-br ${themeStyles.headerBg} p-2.5 text-white`}
      >
        {theme === "cyan" ? (
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-white/25">
              <Music className="h-3 w-3" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-[8px] font-bold leading-tight">Now Playing</span>
              <span className="text-[7px] text-white/80">Track 03 / 12</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-white/25">
              <MessageCircle className="h-3 w-3" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-[8px] font-bold leading-tight">3 שיחות חדשות</span>
              <span className="text-[7px] text-white/80">לפני 2 דק׳</span>
            </div>
          </div>
        )}

        <div className="mt-2 flex h-1 w-full items-center overflow-hidden rounded-full bg-white/22">
          <div className="h-full w-2/3 rounded-full bg-white" />
        </div>
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-white px-1.5 py-1.5"
          >
            <div
              className="h-5 w-5 shrink-0 rounded-md"
              style={{ backgroundColor: themeStyles.accentSoft }}
            >
              <div
                className="m-1 h-3 w-3 rounded-sm"
                style={{ backgroundColor: themeStyles.accent }}
              />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="h-1.5 w-full rounded bg-zinc-200" />
              <div className="h-1 w-2/3 rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex items-center justify-around rounded-xl bg-white px-1 py-1.5 ring-1 ring-zinc-100">
        {[Home, Heart, Bookmark, User].map((Icon, i) => (
          <button
            key={i}
            className="grid h-6 w-6 place-items-center"
            style={{ color: i === 0 ? themeStyles.accent : "#a3a3a3" }}
          >
            <Icon className="h-3 w-3" strokeWidth={i === 0 ? 2.4 : 2} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default AppShowcasePhone;
