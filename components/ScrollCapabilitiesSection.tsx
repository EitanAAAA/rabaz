"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Database, GitBranch, Globe, Server, Sparkles } from "lucide-react";
import { IconCloud } from "@/components/magicui/icon-cloud";
import { CollectionSurfer, type CollectionItem } from "@/components/ui/collection-surfer";
import OrgRoofFigures from "@/components/OrgRoofFigures";

gsap.registerPlugin(ScrollTrigger);

type VisualName = "surfer" | "cloud" | "circuit" | "phones" | "training";

type Capability = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  visual: VisualName;
};

type Stage = {
  enter: number;
  hold: number;
  exit: number;
  presence: number;
};

const capabilities: Capability[] = [
  {
    id: "web",
    title: "פיתוח אתרים",
    subtitle: "אתרים עם חוויית משתמש חדה, נקייה ומדויקת",
    description:
      "אתרים וממשקים עם עיצוב מוקפד, תנועה עדינה, התאמה למובייל וקוד שמוכן להמשך פיתוח.",
    visual: "surfer"
  },
  {
    id: "cloud",
    title: "פלטפורמות שאנחנו משתמשים בהן",
    subtitle: "סט כלים מודרני שמאפשר לבנות מהר, נקי ויציב",
    description:
      "React, Next.js, TypeScript, Tailwind, Vercel, Git, Firebase, Docker ועוד כלים שמתחברים לפיתוח מוצר אמיתי.",
    visual: "cloud"
  },
  {
    id: "circuit",
    title: "שילובי AI",
    subtitle: "AI שמתחבר לתהליך העבודה ולא נשאר גימיק בצד",
    description:
      "עוזרים חכמים, אוטומציות, חיפוש סמנטי, חילוץ מידע ודשבורדים שמייצרים ערך אמיתי.",
    visual: "circuit"
  },
  {
    id: "phones",
    title: "פיתוח אפליקציות",
    subtitle: "אפליקציות מובייל שנראות טוב ועובדות חלק בשטח",
    description:
      "אפליקציות Android ו-iOS עם React Native ו-Expo, כולל התראות, אחסון מקומי, API וחוויית שימוש טבעית.",
    visual: "phones"
  },
  {
    id: "training",
    title: "הדרכות מלאות",
    subtitle: "כל מערכת מגיעה עם ידע ברור להפעלה עצמאית",
    description:
      "מדריכים, סרטונים, מסמכי תפעול וליווי שמכניסים את הצוות לעבודה בצורה חלקה ובטוחה.",
    visual: "training"
  }
];

const surferItems: CollectionItem[] = [
  { id: 1, title: "ANALYTICS DASHBOARD", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80" },
  { id: 2, title: "STUDIO LANDING", image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1400&q=80" },
  { id: 3, title: "ADMIN PANEL", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80" },
  { id: 4, title: "PRODUCT LANDING", image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1400&q=80" },
  { id: 5, title: "DATA DASHBOARD", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80" },
  { id: 6, title: "MARKETING SITE", image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1400&q=80" },
  { id: 7, title: "CRM DASHBOARD", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80" },
  { id: 8, title: "DESIGN PORTFOLIO", image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=1400&q=80" },
  { id: 9, title: "SAAS PRICING", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80" },
  { id: 10, title: "BRAND SHOWCASE", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1400&q=80" }
];

const iconSlugs = [
  "typescript", "javascript", "dart", "java", "react", "flutter", "android", "html5", "css3",
  "nodedotjs", "express", "nextdotjs", "prisma", "amazonaws", "postgresql", "firebase", "nginx",
  "vercel", "testinglibrary", "jest", "cypress", "docker", "git", "jira", "github", "gitlab",
  "visualstudiocode", "androidstudio", "sonarqube", "figma"
];

const SCROLL_PIXELS_PER_SLOT = 1100;
const TOTAL_SCROLL_DISTANCE = SCROLL_PIXELS_PER_SLOT * capabilities.length;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function deriveStage(sectionProgress: number, index: number, total: number): Stage {
  const span = 1 / total;
  const center = (index + 0.5) * span;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const fadeWidth = span * 0.28;
  const fadeInEnd = isFirst ? -span * 0.05 : center - span * 0.34;
  const fadeInStart = fadeInEnd - fadeWidth;
  const fadeOutStart = isLast ? 1 + span * 0.05 : center + span * 0.34;
  const fadeOutEnd = fadeOutStart + fadeWidth;

  const enter = clamp01((sectionProgress - fadeInStart) / Math.max(0.0001, fadeInEnd - fadeInStart));
  const exit = clamp01((sectionProgress - fadeOutStart) / Math.max(0.0001, fadeOutEnd - fadeOutStart));
  const hold = clamp01((sectionProgress - fadeInEnd) / Math.max(0.0001, fadeOutStart - fadeInEnd));
  const presence = enter * (1 - exit);

  return { enter, hold, exit, presence };
}

function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#142111_1px,transparent_1px),linear-gradient(90deg,#142111_1px,transparent_1px)] [background-size:52px_52px]" />
  );
}

function StageEdgeMask() {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-16 bg-gradient-to-r from-[#fbfcf3] via-[#fbfcf3]/94 to-transparent sm:w-44" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-16 bg-gradient-to-l from-[#fbfcf3] via-[#fbfcf3]/94 to-transparent sm:w-44" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-4 bg-gradient-to-b from-[#fbfcf3] to-transparent sm:h-6" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-4 bg-gradient-to-t from-[#fbfcf3] to-transparent sm:h-6" />
    </>
  );
}

function StageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.45rem] bg-[#fbfcf3] sm:rounded-[2rem]" dir="ltr">
      <GridBackground />
      <StageEdgeMask />
      {children}
    </div>
  );
}

function StageWrapper({ stage, children, interactive }: { stage: Stage; children: ReactNode; interactive: boolean; }) {
  const enterY = -90 * (1 - stage.enter);
  const exitY = 130 * stage.exit;
  const blur = (1 - stage.enter) * 12 + stage.exit * 12;
  const style: CSSProperties = {
    opacity: stage.presence,
    transform: `translate3d(0, ${enterY + exitY}px, 0)`,
    filter: `blur(${blur.toFixed(2)}px)`,
    pointerEvents: interactive && stage.presence > 0.4 ? "auto" : "none",
    willChange: "transform, opacity"
  };
  return (
    <div className="absolute inset-0" style={style}>
      {children}
    </div>
  );
}

function CapabilityDescription({ capability }: { capability: Capability }) {
  return (
    <div
      className="pointer-events-none absolute right-4 top-6 z-30 max-w-[calc(100%-2rem)] text-right text-[#142111] sm:right-10 sm:top-7 sm:max-w-[460px] lg:right-12 lg:max-w-[520px]"
      dir="rtl"
    >
      <p className="text-sm font-medium leading-5 text-[#142111]/72 sm:text-base sm:leading-6">
        {capability.description}
      </p>
    </div>
  );
}

function SurferPreview({ holdProgress }: { holdProgress: number }) {
  return (
    <div className="absolute inset-0" dir="ltr">
      <CollectionSurfer
        items={surferItems}
        variant="uplift"
        progress={holdProgress}
        embedded
        showOverlay={false}
        stepX={320}
        stepY={-28}
        stepZ={-260}
        cardWidth={390}
        cardHeight={260}
        sceneOffsetX={-180}
        sceneOffsetY={-60}
        perspectiveOrigin="25% 35%"
      />
    </div>
  );
}

function CloudPreview({ presence, holdProgress }: { presence: number; holdProgress: number }) {
  if (presence < 0.05) return null;
  const images = iconSlugs.map((slug) => `https://cdn.simpleicons.org/${slug}/${slug}`);
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-[2vh]" dir="ltr">
      <div className="relative h-full max-h-[min(86vh,_700px)] aspect-square -translate-y-[6vh]">
        <IconCloud images={images} size={700} spread={holdProgress} />
      </div>
    </div>
  );
}

function CircuitPreview() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const nodes = useMemo(
    () => [
      { id: "user", x: 60, y: 150, label: "User", icon: Globe },
      { id: "router", x: 176, y: 150, label: "AI Router", icon: GitBranch },
      { id: "agent", x: 305, y: 78, label: "Agent", icon: Sparkles },
      { id: "api", x: 305, y: 222, label: "API", icon: Server },
      { id: "db", x: 430, y: 150, label: "Data", icon: Database }
    ],
    []
  );
  const connections = [
    ["user", "router"],
    ["router", "agent"],
    ["router", "api"],
    ["agent", "db"],
    ["api", "db"]
  ];

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    const setup = async () => {
      const mod = await import("gsap");
      const lib = mod.gsap || mod.default;
      ctx = lib.context(() => {
        lib.to("[data-circuit-pulse]", { strokeDashoffset: -80, duration: 1.8, repeat: -1, ease: "none" });
        lib.to("[data-circuit-node]", { scale: 1.05, duration: 1.8, stagger: 0.14, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%" });
      }, wrapRef);
    };
    void setup();
    return () => ctx?.revert();
  }, []);

  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <div ref={wrapRef} className="absolute inset-0 flex items-center justify-center px-6" dir="ltr">
      <div className="relative w-full max-w-[720px] rounded-2xl border border-[#142111]/18 bg-white/78 p-5 shadow-[0_35px_90px_rgba(20,33,17,0.1)] backdrop-blur-sm sm:p-7">
        <svg viewBox="0 0 500 300" className="h-[260px] w-full overflow-visible sm:h-[340px]">
          {connections.map(([from, to]) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            return (
              <g key={`${from}-${to}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(20,33,17,0.22)" strokeWidth="2" />
                <line data-circuit-pulse x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#142111" strokeWidth="2.5" strokeDasharray="12 22" strokeLinecap="round" />
              </g>
            );
          })}
          {nodes.map((node) => {
            const Icon = node.icon;
            return (
              <foreignObject key={node.id} x={node.x - 42} y={node.y - 42} width="84" height="84" data-circuit-node>
                <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-xl border border-[#142111]/20 bg-[#fbfcf3] text-[#142111]">
                  <Icon className="h-5 w-5" />
                  <span className="mt-2 text-[11px] font-bold">{node.label}</span>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function PhoneFrame({ title, accent, style }: { title: string; accent: string; style?: CSSProperties; }) {
  return (
    <div
      className="absolute bottom-[6%] h-[320px] w-[164px] origin-bottom rounded-[1.85rem] border border-[#142111]/25 bg-white/88 p-2.5 shadow-[0_36px_84px_rgba(20,33,17,0.16)] sm:h-[420px] sm:w-[212px] sm:rounded-[2.15rem] sm:p-3"
      style={style}
    >
      <div className="mx-auto mb-2 h-4 w-16 rounded-b-2xl bg-[#142111] sm:mb-3 sm:h-5 sm:w-20" />
      <div className={`h-[calc(100%-1.5rem)] rounded-[1.4rem] border border-[#142111]/15 ${accent} p-3 sm:h-[calc(100%-2rem)] sm:rounded-[1.6rem] sm:p-4`}>
        <div className="mb-3 h-16 rounded-xl border border-[#142111]/15 bg-white sm:mb-4 sm:h-20" />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#142111]/45 sm:text-xs">Expo app</p>
        <h4 className="mt-1 text-xl font-bold text-[#142111] sm:mt-2 sm:text-2xl">{title}</h4>
        <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-7 rounded-xl border border-[#142111]/12 bg-white sm:h-9" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhonesPreview({ holdProgress }: { holdProgress: number }) {
  const sideReveal = clamp01((holdProgress - 0.18) / 0.5);
  const centerScale = 0.94 + 0.08 * (1 - sideReveal);
  const sideScale = 0.78 + 0.12 * sideReveal;
  const sideShift = 200 * sideReveal;
  const sideRotation = 12 * sideReveal;
  const sideLift = 24 * (1 - sideReveal);

  return (
    <div className="absolute inset-0 flex items-center justify-center" dir="ltr">
      <div className="relative h-full w-full max-w-[760px]">
        <PhoneFrame
          title="Dashboard"
          accent="bg-[#e8ecdd]"
          style={{
            left: "50%",
            transform: `translate(calc(-50% - ${sideShift}px), ${sideLift}px) rotate(${-sideRotation}deg) scale(${sideScale})`,
            opacity: sideReveal,
            zIndex: 1
          }}
        />
        <PhoneFrame
          title="Profile"
          accent="bg-[#edf0e5]"
          style={{
            left: "50%",
            transform: `translate(calc(-50% + ${sideShift}px), ${sideLift}px) rotate(${sideRotation}deg) scale(${sideScale})`,
            opacity: sideReveal,
            zIndex: 1
          }}
        />
        <PhoneFrame
          title="Tasks"
          accent="bg-white"
          style={{
            left: "50%",
            transform: `translate(-50%, 0) rotate(0deg) scale(${centerScale})`,
            opacity: 1,
            zIndex: 3
          }}
        />
      </div>
    </div>
  );
}

function TrainingPreview() {
  return (
    <div className="absolute inset-0 grid place-items-center px-6" dir="rtl">
      <div className="grid w-full max-w-[760px] gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#142111]/18 bg-white/88 p-5 shadow-[0_35px_80px_rgba(20,33,17,0.1)] backdrop-blur-sm sm:p-7">
          <h3 className="text-2xl font-bold text-[#142111] sm:text-3xl">הדרכה מלאה</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#142111]/62 sm:mt-4 sm:text-base sm:leading-7">
            מדריכים, סרטונים, מסמכי תפעול והטמעה לצוותים.
          </p>
        </div>
        <div className="rounded-2xl border border-[#142111]/18 bg-white/82 p-4 shadow-[0_35px_80px_rgba(20,33,17,0.1)] backdrop-blur-sm sm:p-5">
          {["מדריך משתמשים", "הדרכת מנהלים", "סרטונים קצרים", "מסמך תפעול"].map((item) => (
            <div key={item} className="mb-2 flex items-center justify-between rounded-xl border border-[#142111]/14 bg-[#fbfcf3] px-3 py-2.5 text-xs font-bold text-[#142111] sm:mb-3 sm:px-4 sm:py-3 sm:text-sm">
              <span>{item}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#142111]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualForCapability({ visual, stage }: { visual: VisualName; stage: Stage; }) {
  if (stage.presence < 0.005) return null;
  if (visual === "surfer") return <SurferPreview holdProgress={stage.hold} />;
  if (visual === "cloud") return <CloudPreview presence={stage.presence} holdProgress={stage.hold} />;
  if (visual === "circuit") return <CircuitPreview />;
  if (visual === "phones") return <PhonesPreview holdProgress={stage.hold} />;
  if (visual === "training") return <TrainingPreview />;
  return null;
}

function TopStackNav({
  active,
  localProgress,
  setActive
}: {
  active: number;
  localProgress: number;
  setActive: (index: number) => void;
}) {
  return (
    <div className="absolute left-4 top-4 z-40 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 text-[#142111] sm:left-6 sm:top-5 sm:gap-4 lg:left-8 lg:top-7" dir="ltr">
      <button className="relative flex h-10 w-10 items-center justify-center text-sm font-bold sm:h-12 sm:w-12 sm:text-base">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <polygon points="50,4 88,25 88,75 50,96 12,75 12,25" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
        {String(active + 1).padStart(2, "0")}
      </button>

      <div className="min-w-[92px] sm:min-w-[116px]">
        <div className="text-[14px] font-bold leading-none tracking-[0.06em] sm:text-[17px]">{String(active + 1).padStart(2, "0")}</div>
        <div className="mt-2 h-[3px] w-20 overflow-hidden bg-[#142111]/18 sm:mt-3 sm:w-28">
          <div className="h-full bg-[#142111] transition-[width] duration-200" style={{ width: `${(localProgress * 100).toFixed(2)}%` }} />
        </div>
      </div>

      <div className="text-base font-bold text-[#142111]/55 sm:text-xl">
        {active + 1} / {capabilities.length}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {capabilities.map((item, index) => {
          const isActive = index === active;
          return (
            <button key={item.id} onClick={() => setActive(index)} className="group relative h-9 w-9 text-[#142111] sm:h-12 sm:w-12" aria-label={`מעבר אל ${item.title}`}>
              <svg className={`absolute inset-0 h-full w-full transition-opacity ${isActive ? "opacity-100" : "opacity-25"}`} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={index % 2 ? "18 9" : "28 7"} />
                {isActive ? <path d="M50 7 A43 43 0 0 1 93 50" fill="none" stroke="currentColor" strokeWidth="5" /> : null}
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold sm:text-sm ${isActive ? "text-[#142111]" : "text-[#142111]/35"}`}>{String(index + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ScrollCapabilitiesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const [sectionProgress, setSectionProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => `+=${TOTAL_SCROLL_DISTANCE}`,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const next = self.progress;
        if (Math.abs(progressRef.current - next) < 0.0006) return;
        progressRef.current = next;
        setSectionProgress(next);
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const stages = useMemo(
    () => capabilities.map((_, index) => deriveStage(sectionProgress, index, capabilities.length)),
    [sectionProgress]
  );

  const activeIndex = stages.reduce((bestIndex, current, idx) => (current.presence > stages[bestIndex].presence ? idx : bestIndex), 0);
  const activeStage = stages[activeIndex];

  const handleSetActive = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const targetProgress = (index + 0.5) / capabilities.length;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({
      top: sectionTop + TOTAL_SCROLL_DISTANCE * targetProgress,
      behavior: "smooth"
    });
  };

  return (
    <section
      ref={sectionRef}
      className="assistant-capabilities relative bg-[#fbfcf3] text-[#142111]"
      data-active={activeIndex}
      data-progress={activeStage.hold.toFixed(3)}
      dir="rtl"
      style={{ height: `calc(100svh + ${TOTAL_SCROLL_DISTANCE}px)` }}
    >
      <OrgRoofFigures />
      <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden">
        <TopStackNav active={activeIndex} localProgress={activeStage.hold} setActive={handleSetActive} />

        <CapabilityDescription capability={capabilities[activeIndex]} />

        <div className="absolute inset-x-0 top-[14%] bottom-[8%] flex items-center justify-center px-4 sm:px-6 lg:px-10">
          <div className="relative h-full w-full max-w-[1100px]">
            <StageShell>
              {capabilities.map((capability, index) => (
                <StageWrapper key={`stage-${capability.id}`} stage={stages[index]} interactive={index === activeIndex}>
                  <VisualForCapability visual={capability.visual} stage={stages[index]} />
                </StageWrapper>
              ))}
            </StageShell>
          </div>
        </div>
      </div>
    </section>
  );
}
