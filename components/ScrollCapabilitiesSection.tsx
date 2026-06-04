"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";
import { BookOpen, Check, FileText, Play, Users, Video } from "lucide-react";
import { DevStackScroll } from "@/components/ui/dev-stack-scroll";
import { CollectionSurfer, type CollectionItem } from "@/components/ui/collection-surfer";
import OrgRoofFigures from "@/components/OrgRoofFigures";
import { AppShowcasePhone } from "@/components/ui/app-showcase-phone";
import { AiSculpture } from "@/components/ui/ai-sculpture";
import { projectsCatalog } from "@/lib/projects/ProjectsCatalog";

gsap.registerPlugin(ScrollTrigger);

type VisualName = "surfer" | "cloud" | "circuit" | "phones" | "training";

type SideHighlight = {
  label: string;
  text: string;
};

type Capability = {
  id: string;
  title: string;
  subtitle: string;
  descriptionTitle: string;
  description: string;
  visual: VisualName;
  sideEyebrow: string;
  sideHeading: string;
  sideBody: string;
  highlights: SideHighlight[];
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
    descriptionTitle: "אתרים שמובילים לתוצאה",
    description:
      "אתרים וממשקים עם עיצוב מוקפד, תנועה עדינה, התאמה למובייל וקוד שמוכן להמשך פיתוח.",
    visual: "surfer",
    sideEyebrow: "WEB · 01",
    sideHeading: "מהמוקאפ ועד לפרודקשן",
    sideBody:
      "אנחנו לוקחים פרויקט מהשלב הראשון — מחקר, אפיון ועיצוב — עד אתר חי שמותקן בענן ומוכן לתעבורה אמיתית.",
    highlights: [
      { label: "Design", text: "אפיון UX מלא וספריית קומפוננטים" },
      { label: "Stack", text: "Next.js, React, TypeScript, Tailwind" },
      { label: "Performance", text: "ציוני Lighthouse 95+ ושירות מהיר" }
    ]
  },
  {
    id: "cloud",
    title: "פלטפורמות שאנחנו משתמשים בהן",
    subtitle: "סט כלים מודרני שמאפשר לבנות מהר, נקי ויציב",
    descriptionTitle: "הסט הטכנולוגי שלנו",
    description:
      "React, Next.js, TypeScript, Tailwind, Vercel, Git, Firebase, Docker ועוד כלים שמתחברים לפיתוח מוצר אמיתי.",
    visual: "cloud",
    sideEyebrow: "STACK · 02",
    sideHeading: "כלים שעובדים יחד",
    sideBody:
      "כל פלטפורמה שאנחנו משלבים נבחרה כי היא מהירה לפיתוח, יציבה בפרודקשן וקלה לתחזוקה לאורך זמן.",
    highlights: [
      { label: "Frontend", text: "React, Next.js, Tailwind, Framer Motion" },
      { label: "Backend", text: "Node, Firebase, Postgres, Prisma" },
      { label: "DevOps", text: "Vercel, Docker, Git, GitHub Actions" }
    ]
  },
  {
    id: "circuit",
    title: "שילובי AI",
    subtitle: "AI שמתחבר לתהליך העבודה ולא נשאר גימיק בצד",
    descriptionTitle: "AI שמשתלב בעבודה היומית",
    description:
      "עוזרים חכמים, אוטומציות, חיפוש סמנטי, חילוץ מידע ודשבורדים שמייצרים ערך אמיתי.",
    visual: "circuit",
    sideEyebrow: "AI · 03",
    sideHeading: "מודלים שמבינים את הנתונים שלך",
    sideBody:
      "אנחנו בונים שכבת AI שלמה סביב המוצר — מ-LLM ועד RAG ו-Vision — בלי גימיקים, רק יכולות שמשנות את חווית המשתמש.",
    highlights: [
      { label: "LLM", text: "OpenAI, Claude, Gemini עם RAG מותאם" },
      { label: "Vision", text: "ניתוח תמונה, OCR וזיהוי אוטומטי" },
      { label: "Automations", text: "צ׳אטבוטים, חילוץ מידע ודשבורדים חכמים" }
    ]
  },
  {
    id: "phones",
    title: "פיתוח אפליקציות",
    subtitle: "אפליקציות מובייל שנראות טוב ועובדות חלק בשטח",
    descriptionTitle: "אפליקציה אחת, כל הפלטפורמות",
    description:
      "אפליקציות Android ו-iOS עם React Native ו-Expo, כולל התראות, אחסון מקומי, API וחוויית שימוש טבעית.",
    visual: "phones",
    sideEyebrow: "MOBILE · 04",
    sideHeading: "iOS ו-Android בקוד אחד",
    sideBody:
      "אנחנו מפתחים בקוד יחיד שרץ על שתי הפלטפורמות, עם ביצועים נייטיביים, התראות, אחסון מקומי וסנכרון מלא לשרת.",
    highlights: [
      { label: "Framework", text: "React Native, Expo, TypeScript" },
      { label: "Native", text: "התראות, מצלמה, מיקום ואחסון מקומי" },
      { label: "Delivery", text: "App Store, Google Play ו-OTA Updates" }
    ]
  },
  {
    id: "training",
    title: "תוכנית הדרכה",
    subtitle: "לכל מערכת ואפליקציה שאנחנו בונים — הדרכה מלאה",
    descriptionTitle: "הצוות שלך עובד באופן עצמאי",
    description:
      "וידאו, מדריך משתמשים, הדרכה למנהלים ומסמך תפעול. הצוות שלך עולה לאוויר עם המערכת בלי תלות בנו.",
    visual: "training",
    sideEyebrow: "TRAINING · 05",
    sideHeading: "ידע שנשאר אצלך",
    sideBody:
      "כל מערכת מגיעה עם חבילת הדרכה מותאמת — כדי שהצוות שלך יוכל להוביל את המוצר בלי להישען עלינו.",
    highlights: [
      { label: "Video", text: "סרטוני הדרכה קצרים לכל פיצ׳ר במערכת" },
      { label: "Docs", text: "מדריך משתמשים ומסמך תפעול מלא" },
      { label: "Managers", text: "הדרכת מנהלים על דשבורד הניהול" }
    ]
  }
];

const surferItems: CollectionItem[] = projectsCatalog.getAll().map((project, index) => ({
  id: index + 1,
  title: project.name.toUpperCase(),
  image: project.image
}));

const SCROLL_PIXELS_PER_SLOT = 2400;
const TOTAL_SCROLL_DISTANCE = SCROLL_PIXELS_PER_SLOT * capabilities.length;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothStep = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);

function deriveStage(sectionProgress: number, index: number, total: number): Stage {
  const span = 1 / total;
  const center = (index + 0.5) * span;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const transitionWidth = span * 0.18;
  const holdHalf = span * 0.32;

  const fadeInBoost = isLast ? span * 0.06 : 0;
  const fadeInEnd = isFirst ? -span * 0.05 : center - holdHalf - fadeInBoost;
  const fadeInStart = fadeInEnd - transitionWidth;
  const fadeOutStart = isLast ? 1 + span * 0.05 : center + holdHalf;
  const fadeOutEnd = fadeOutStart + transitionWidth;

  const enter = clamp01((sectionProgress - fadeInStart) / Math.max(0.0001, fadeInEnd - fadeInStart));
  const exit = clamp01((sectionProgress - fadeOutStart) / Math.max(0.0001, fadeOutEnd - fadeOutStart));
  const hold = clamp01((sectionProgress - fadeInEnd) / Math.max(0.0001, fadeOutStart - fadeInEnd));
  const presence = enter * (1 - exit);

  return { enter, hold, exit, presence };
}

function GridBackground() {
  const mask =
    "radial-gradient(ellipse 72% 96% at 32% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 38%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0) 92%)";
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(20, 33, 17, 0.28) 1px, transparent 0)",
        backgroundSize: "20px 20px",
        WebkitMaskImage: mask,
        maskImage: mask
      }}
    />
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
    <div className="capability-stage-shell relative h-full w-full overflow-hidden rounded-[1.45rem] bg-[#fbfcf3] sm:rounded-[2rem]" dir="ltr">
      <GridBackground />
      <StageEdgeMask />
      {children}
    </div>
  );
}

function StageWrapper({ stage, children, interactive }: { stage: Stage; children: ReactNode; interactive: boolean; }) {
  const enterEased = smoothStep(stage.enter);
  const exitEased = smoothStep(stage.exit);
  const enterY = (1 - enterEased) * 100;
  const exitY = -exitEased * 100;
  const totalY = enterY + exitY;
  const isHidden = stage.enter <= 0.0001 || stage.exit >= 0.9999;
  const style: CSSProperties = {
    transform: `translate3d(0, ${totalY.toFixed(3)}%, 0)`,
    pointerEvents: interactive && stage.presence > 0.4 ? "auto" : "none",
    willChange: "transform",
    visibility: isHidden ? "hidden" : "visible"
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
      className="pointer-events-none absolute left-4 right-4 top-[64px] z-30 mx-auto max-w-none text-center text-[#142111] sm:left-auto sm:right-10 sm:top-7 sm:mx-0 sm:max-w-[460px] sm:text-right lg:right-12 lg:max-w-[520px]"
      dir="rtl"
    >
      <span
        key={`cap-eyebrow-${capability.id}`}
        className="capability-fade mb-1.5 inline-flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.26em] text-[#142111]/55 sm:mb-2 sm:text-[10.5px] sm:tracking-[0.28em]"
      >
        <span className="h-px w-6 bg-[#142111]/35" />
        {capability.sideEyebrow}
      </span>
      <h3
        key={`cap-title-${capability.id}`}
        className="capability-fade mb-1 text-[16px] font-bold leading-[1.2] text-[#142111] sm:mb-2 sm:text-[22px] sm:leading-[1.25] lg:text-[24px]"
        style={{ animationDelay: "0.05s" }}
      >
        {capability.descriptionTitle}
      </h3>
      <p
        key={`cap-body-${capability.id}`}
        className="capability-fade text-[13px] font-medium leading-[1.45] text-[#142111]/72 sm:text-[18px] sm:leading-[1.55]"
        style={{ animationDelay: "0.1s" }}
      >
        {capability.description}
      </p>
    </div>
  );
}

function CapabilitySidePanel({ capability }: { capability: Capability }) {
  return (
    <aside
      className="pointer-events-none absolute right-10 z-30 hidden text-right text-[#142111] lg:right-12 lg:top-[58%] lg:block lg:w-[300px] lg:-translate-y-1/2 xl:right-12 xl:w-[330px] 2xl:right-14 2xl:w-[360px]"
      dir="rtl"
      aria-label="פרטים נוספים"
    >
      <div
        key={`side-${capability.id}`}
        className="capability-side-fade flex flex-col gap-5"
      >
        <h4 className="text-[20px] font-bold leading-[1.22] text-[#142111] xl:text-[22px]">
          {capability.sideHeading}
        </h4>

        <p className="text-[14.5px] font-medium leading-[1.62] text-[#142111]/72 xl:text-[15px]">
          {capability.sideBody}
        </p>

        <ul className="flex flex-col gap-3.5 border-t border-[#142111]/12 pt-4">
          {capability.highlights.map((item) => (
            <li key={item.label} className="flex flex-col gap-0.5 text-right">
              <span className="text-[15px] font-bold leading-tight text-[#142111] xl:text-[15.5px]">
                {item.label}
              </span>
              <span className="text-[13.5px] font-medium leading-snug text-[#142111]/65 xl:text-[14px]">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function SurferPreview({ holdProgress, isMobile }: { holdProgress: number; isMobile: boolean }) {
  return (
    <div className="absolute inset-0" dir="ltr">
      <CollectionSurfer
        items={surferItems}
        variant="uplift"
        progress={holdProgress}
        embedded
        showOverlay={false}
        stepX={isMobile ? 150 : 320}
        stepY={isMobile ? -16 : -28}
        stepZ={isMobile ? -150 : -260}
        cardWidth={isMobile ? 232 : 390}
        cardHeight={isMobile ? 152 : 260}
        sceneOffsetX={isMobile ? -18 : -180}
        sceneOffsetY={isMobile ? -8 : -60}
        perspectiveOrigin={isMobile ? "50% 42%" : "25% 35%"}
      />
    </div>
  );
}

function CloudPreview({ stage }: { stage: Stage }) {
  return <DevStackScroll stage={stage} />;
}

function CircuitPreview({ stage }: { stage: Stage }) {
  return <AiSculpture stage={stage} />;
}

function PhonesPreview({ stage }: { stage: Stage }) {
  return <AppShowcasePhone stage={stage} />;
}

type TrainingModule = {
  icon: typeof BookOpen;
  title: string;
  duration: string;
  caption: string;
  color: string;
  onColor: string;
};

const trainingModules: TrainingModule[] = [
  {
    icon: BookOpen,
    title: "מדריך משתמשים",
    duration: "18 דק׳",
    caption: "פותחים את המסך הראשי ומגדירים העדפות לכל הצוות.",
    color: "#142111",
    onColor: "#ffffff"
  },
  {
    icon: Video,
    title: "סרטוני הסבר",
    duration: "9 דק׳",
    caption: "מציגים שלב אחר שלב כיצד להוסיף משתמש חדש למערכת.",
    color: "#22D3EE",
    onColor: "#0B3B45"
  },
  {
    icon: Users,
    title: "הדרכת מנהלים",
    duration: "12 דק׳",
    caption: "סוקרים את לוח הבקרה הניהולי, ההרשאות והדוחות.",
    color: "#64748B",
    onColor: "#ffffff"
  },
  {
    icon: FileText,
    title: "מסמך תפעול",
    duration: "8 דק׳",
    caption: "מסבירים על תהליך הגיבוי האוטומטי וההתאוששות.",
    color: "#EAB308",
    onColor: "#3B2F0B"
  }
];

const TRAINING_DWELL_MS = 4200;
const ORBIT_VB = 400;
const ORBIT_C = 200;
const ORBIT_R = 134;
const ORBIT_CIRC = 2 * Math.PI * ORBIT_R;
const ORBIT_NODE_POS = [
  { x: 83, y: 50 },
  { x: 50, y: 83 },
  { x: 17, y: 50 },
  { x: 50, y: 17 }
];

function TrainingPreview({ stage }: { stage: Stage }) {
  const isLive = stage.presence > 0.05;
  const [activeIndex, setActiveIndex] = useState(0);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const percentRef = useRef<HTMLSpanElement | null>(null);
  const percentValRef = useRef(0);
  const nodesWrapRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const outerRingRef = useRef<HTMLDivElement | null>(null);

  const active = trainingModules[activeIndex];
  const total = trainingModules.length;

  useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, TRAINING_DWELL_MS);
    return () => window.clearInterval(id);
  }, [isLive, total]);

  useEffect(() => {
    const outer = outerRingRef.current;
    if (!outer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const anim = animate(outer, {
      rotate: "1turn",
      duration: 42000,
      ease: "linear",
      loop: true
    });
    return () => {
      anim.pause();
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const progress = (activeIndex + 1) / total;

    if (ringRef.current) {
      const target = ORBIT_CIRC * (1 - progress);
      const a = animate(ringRef.current, {
        strokeDashoffset: target,
        duration: reduce ? 0 : 1000,
        ease: "outCubic"
      });
      cleanups.push(() => a.pause());
    }

    if (percentRef.current) {
      const counter = { v: percentValRef.current };
      const targetPct = Math.round(progress * 100);
      const a = animate(counter, {
        v: targetPct,
        duration: reduce ? 0 : 1000,
        ease: "outCubic",
        onUpdate: () => {
          percentValRef.current = counter.v;
          if (percentRef.current) percentRef.current.textContent = String(Math.round(counter.v));
        }
      });
      cleanups.push(() => a.pause());
    }

    if (nodesWrapRef.current) {
      const node = nodesWrapRef.current.querySelector<HTMLElement>(`[data-node="${activeIndex}"]`);
      if (node) {
        const a = animate(node, {
          scale: [0.6, 1],
          duration: reduce ? 0 : 620,
          ease: "outBack"
        });
        cleanups.push(() => a.pause());
      }
    }

    if (titleRef.current) {
      const a = animate(titleRef.current, {
        translateY: [12, 0],
        opacity: [0, 1],
        duration: reduce ? 0 : 520,
        ease: "outCubic"
      });
      cleanups.push(() => a.pause());
    }

    if (captionRef.current) {
      const a = animate(captionRef.current, {
        translateY: [10, 0],
        opacity: [0, 1],
        duration: reduce ? 0 : 520,
        delay: 90,
        ease: "outCubic"
      });
      cleanups.push(() => a.pause());
    }

    return () => cleanups.forEach((c) => c());
  }, [activeIndex, total]);

  return (
    <div className="absolute inset-0 grid place-items-center px-4 py-4 sm:py-6" dir="rtl">
      <div className="flex flex-col items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-2 rounded-full border border-[#142111]/12 bg-white/70 px-3.5 py-1.5 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22D3EE] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22D3EE]" />
          </span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.26em] text-[#142111]/70">
            מסלול ההדרכה
          </span>
        </div>

        <div className="relative aspect-square w-[290px] sm:w-[330px] md:w-[350px]">
          <div
            ref={outerRingRef}
            className="absolute inset-1 rounded-full border-2 border-dashed border-[#142111]/12"
            style={{ willChange: "transform" }}
          />

          <svg viewBox={`0 0 ${ORBIT_VB} ${ORBIT_VB}`} className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx={ORBIT_C}
              cy={ORBIT_C}
              r={ORBIT_R}
              fill="none"
              stroke="rgba(20,33,17,0.10)"
              strokeWidth="10"
            />
            <circle
              ref={ringRef}
              cx={ORBIT_C}
              cy={ORBIT_C}
              r={ORBIT_R}
              fill="none"
              stroke={active.color}
              strokeWidth="10"
              strokeLinecap="round"
              style={{
                strokeDasharray: ORBIT_CIRC,
                strokeDashoffset: ORBIT_CIRC,
                transition: "stroke 0.7s ease"
              }}
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-0.5 text-center">
              <div className="flex items-end gap-0.5">
                <span ref={percentRef} className="text-[44px] font-bold leading-none text-[#142111] sm:text-[52px]">
                  0
                </span>
                <span className="mb-1.5 text-[20px] font-bold text-[#142111]/55 sm:text-[24px]">%</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#142111]/45">
                מהתוכנית הושלם
              </span>
              <div ref={titleRef} className="mt-2 flex flex-col items-center gap-0.5">
                <span className="text-[15px] font-bold leading-tight text-[#142111] sm:text-[16px]">
                  {active.title}
                </span>
                <span className="text-[10px] font-semibold text-[#142111]/45">{active.duration}</span>
              </div>
            </div>
          </div>

          <div ref={nodesWrapRef} className="absolute inset-0">
            {trainingModules.map((m, i) => {
              const Icon = m.icon;
              const pos = ORBIT_NODE_POS[i];
              const isDone = i < activeIndex;
              const isActive = i === activeIndex;
              const reached = isDone || isActive;
              return (
                <div
                  key={m.title}
                  className="absolute"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <button
                    type="button"
                    data-node={i}
                    onClick={() => setActiveIndex(i)}
                    className="relative grid h-11 w-11 place-items-center rounded-full border-2 shadow-sm transition-colors duration-500 sm:h-12 sm:w-12"
                    style={{
                      backgroundColor: reached ? m.color : "#ffffff",
                      borderColor: reached ? m.color : "rgba(20,33,17,0.14)",
                      color: reached ? m.onColor : "rgba(20,33,17,0.5)",
                      boxShadow: isActive ? `0 0 0 6px ${m.color}22, 0 10px 24px ${m.color}40` : undefined
                    }}
                    aria-label={m.title}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    )}
                    {isActive ? (
                      <span
                        className="absolute inset-0 animate-ping rounded-full"
                        style={{ boxShadow: `0 0 0 3px ${m.color}66` }}
                      />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <p
          ref={captionRef}
          className="max-w-[330px] text-center text-[12.5px] leading-snug text-[#142111]/68 sm:text-[13px]"
        >
          {active.caption}
        </p>
      </div>
    </div>
  );
}

function useIsMobile(query = "(max-width: 640px)") {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return isMobile;
}

const MOBILE_VISUAL_SCALE: Partial<Record<VisualName, number>> = {
  cloud: 0.82,
  circuit: 0.58,
  phones: 0.56,
  training: 0.74
};

const MOBILE_VISUAL_Y: Partial<Record<VisualName, string>> = {
  circuit: "-8%",
  phones: "-6%",
  training: "-3%"
};

function VisualForCapability({ visual, stage, isMobile }: { visual: VisualName; stage: Stage; isMobile: boolean; }) {
  if (visual === "surfer") return <SurferPreview holdProgress={stage.hold} isMobile={isMobile} />;
  const inner =
    visual === "cloud" ? <CloudPreview stage={stage} /> :
    visual === "circuit" ? <CircuitPreview stage={stage} /> :
    visual === "phones" ? <PhonesPreview stage={stage} /> :
    visual === "training" ? <TrainingPreview stage={stage} /> : null;
  if (!inner) return null;
  const scale = isMobile ? MOBILE_VISUAL_SCALE[visual] : undefined;
  if (scale) {
    const style = {
      "--mobile-visual-scale": scale,
      "--mobile-visual-y": MOBILE_VISUAL_Y[visual] ?? "0%"
    } as CSSProperties;
    return (
      <div className={`capability-mobile-visual capability-mobile-visual--${visual} absolute inset-0 origin-center`} style={style}>
        {inner}
      </div>
    );
  }
  return inner;
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
    <div className="absolute left-0 right-0 top-4 z-40 flex flex-wrap items-center justify-center gap-2 px-4 text-[#142111] sm:left-6 sm:right-auto sm:top-5 sm:max-w-[calc(100%-2rem)] sm:justify-start sm:gap-4 sm:px-0 lg:left-8 lg:top-7" dir="ltr">
      <button className="relative hidden h-10 w-10 items-center justify-center text-sm font-bold sm:flex sm:h-12 sm:w-12 sm:text-base">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <polygon points="50,4 88,25 88,75 50,96 12,75 12,25" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
        {String(active + 1).padStart(2, "0")}
      </button>

      <div className="hidden min-w-[92px] sm:block sm:min-w-[116px]">
        <div className="text-[14px] font-bold leading-none tracking-[0.06em] sm:text-[17px]">{String(active + 1).padStart(2, "0")}</div>
        <div className="mt-2 h-[3px] w-20 overflow-hidden bg-[#142111]/18 sm:mt-3 sm:w-28">
          <div className="h-full bg-[#142111] transition-[width] duration-200" style={{ width: `${(localProgress * 100).toFixed(2)}%` }} />
        </div>
      </div>

      <div className="hidden text-base font-bold text-[#142111]/55 sm:block sm:text-xl">
        {active + 1} / {capabilities.length}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => `+=${TOTAL_SCROLL_DISTANCE}`,
      scrub: 1.35,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const next = self.progress;
        if (Math.abs(progressRef.current - next) < 0.0012) return;
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
        <CapabilitySidePanel capability={capabilities[activeIndex]} />

        <div className="capability-stage-area absolute inset-x-0 top-[31%] bottom-[4%] flex items-center justify-center px-3 sm:top-[14%] sm:bottom-[8%] sm:px-6 lg:justify-start lg:px-10 lg:pl-12 lg:pr-[360px] xl:pl-14 xl:pr-[400px] 2xl:pr-[440px]">
          <div className="relative h-full w-full max-w-[1100px] transition-transform duration-500 lg:max-w-[820px] lg:-translate-x-[90px] xl:max-w-[900px] xl:-translate-x-[150px] 2xl:-translate-x-[200px]">
            <StageShell>
              {capabilities.map((capability, index) => (
                <StageWrapper key={`stage-${capability.id}`} stage={stages[index]} interactive={index === activeIndex}>
                  <VisualForCapability visual={capability.visual} stage={stages[index]} isMobile={isMobile} />
                </StageWrapper>
              ))}
            </StageShell>
          </div>
        </div>
      </div>
    </section>
  );
}
