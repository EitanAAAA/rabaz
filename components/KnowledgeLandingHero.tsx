"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import type { CSSProperties, Ref } from "react";
import { MusicPlayer } from "@/components/ui/music-player";
import { TextAnimate } from "@/components/ui/text-animate";

const projects = [
  {
    name: "מרכז הפרט",
    logo: "/project-logos/merkaz-haprat.png",
    className: "project-font-frank"
  },
  {
    name: "תכלית",
    logo: "/project-logos/tachlit.png",
    className: "project-font-rubik"
  },
  {
    name: "חיזו״ק",
    logo: "/project-logos/chizuk.png",
    className: "project-font-secular"
  },
  {
    name: "הזות״י",
    logo: "/project-logos/hazuti.png",
    className: "project-font-varela"
  },
  {
    name: "לומדים",
    logo: "/project-logos/lomdim.png",
    className: "project-font-alef"
  }
];

const carouselItems = [...projects, ...projects, ...projects, ...projects];

const fallingImages = [
  "/images/rabbanut-hero.jpg",
  "/images/WhatsApp-Image-2025-09-18-at-16.14.19-1-960x640.webp",
  "/images/רבנות-צבאית.jpg",
  "/images/download (1).jpg",
  "/images/download (2).jpg",
  "/images/download (3).jpg",
  "/images/download (4).jpg",
  "/images/download (5).jpg",
  "/images/download.jpg",
  "/images/images.jpg",
  "/images/images (6).jpg",
  "/images/images (7).jpg",
  "/images/images (8).jpg",
  "/images/images (9).jpg",
  "/images/images (10).jpg"
];

const displayedFallingImages = fallingImages;

type CardLayout =
  | { kind: "eye"; eyeX: number; eyeY: number }
  | { kind: "nose"; noseX: number; noseY: number }
  | { kind: "smile"; smileOffset: number };

const cardLayout: CardLayout[] = [
  { kind: "eye", eyeX: -8, eyeY: -16 },
  { kind: "eye", eyeX: 8, eyeY: -16 },
  { kind: "nose", noseX: 0, noseY: -11 },
  { kind: "smile", smileOffset: -5.5 },
  { kind: "smile", smileOffset: -4.5 },
  { kind: "smile", smileOffset: -3.5 },
  { kind: "smile", smileOffset: -2.5 },
  { kind: "smile", smileOffset: 2.5 },
  { kind: "smile", smileOffset: 3.5 },
  { kind: "smile", smileOffset: 4.5 },
  { kind: "smile", smileOffset: 5.5 },
  { kind: "smile", smileOffset: 1.5 },
  { kind: "smile", smileOffset: -1.5 },
  { kind: "smile", smileOffset: -0.5 },
  { kind: "smile", smileOffset: 0.5 }
];

const arrivalOrder = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 1, 2];

const SMILE_SPREAD_PER_OFFSET = 4.4;
const SMILE_LIFT_PER_OFFSET = 0.3;
const SMILE_ROTATE_PER_OFFSET = 1.7;

function KnowledgeHeroNav({
  navRef,
  onLogoClick
}: {
  navRef?: Ref<HTMLElement>;
  onLogoClick?: () => void;
}) {
  return (
    <header ref={navRef} className="knowledge-hero-nav">
      <nav className="knowledge-hero-tabs" aria-label="ניווט ראשי">
        <a href="#home"><TextAnimate animation="blurInUp" by="word">בית</TextAnimate></a>
        <a href="#about"><TextAnimate animation="blurInUp" by="word">אודות</TextAnimate></a>
        <a href="#work"><TextAnimate animation="blurInUp" by="word">פרויקטים</TextAnimate></a>
        <a href="#contact"><TextAnimate animation="blurInUp" by="word">קשר</TextAnimate></a>
      </nav>

      <button className="knowledge-hero-brand" type="button" aria-label="פתח נגן מוזיקה" onClick={onLogoClick}>
        <Image src="/logo-hover-player.png" alt="" width={52} height={52} priority />
        <span><TextAnimate animation="blurInUp" by="word">רבנות צבאית</TextAnimate></span>
      </button>

      <button className="knowledge-video-button" type="button">
        <Play size={16} strokeWidth={2} />
        <span><TextAnimate animation="blurInUp" by="word">צפו בסרטון</TextAnimate></span>
      </button>
    </header>
  );
}

function HeroLogoMusicReveal({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={`hero-logo-music-shell ${isOpen ? "is-open" : ""}`}>
      <MusicPlayer
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        coverArt="/logo-hover-player.png"
        className="w-full max-w-sm"
      />
    </div>
  );
}

function KnowledgeHeroCopy() {
  return (
    <div className="knowledge-hero-copy">
      <h1 className="knowledge-title">
        <span>הכירו את תחום ניהול הידע</span>
        <span>ויכולתה ברבנות הצבאית</span>
      </h1>
      <p>
        <TextAnimate animation="blurInUp" by="word">
          תיק הפרויקטים שלנו
        </TextAnimate>
      </p>
    </div>
  );
}

function ProjectLogoMarquee() {
  return (
    <div className="project-logo-marquee" aria-label="פרויקטים">
      <div className="project-logo-track">
        {carouselItems.map((project, index) => (
          <article className={`project-logo-item ${project.className}`} key={`${project.name}-${index}`}>
            <div className="project-logo-mark">
              <Image src={project.logo} alt="" width={96} height={96} unoptimized />
            </div>
            <span><TextAnimate animation="blurInUp" by="word">{project.name}</TextAnimate></span>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FallingHeroImages({ isReady }: { isReady: boolean }) {
  if (!isReady) return null;

  return (
    <div className="hero-falling-images" aria-hidden="true">
      {displayedFallingImages.map((src, index) => {
        const layout = cardLayout[index] ?? { kind: "smile", smileOffset: 0 };
        let targetX = 0;
        let targetY = 0;
        let targetRotate = 0;
        let kindClass = "";
        if (layout.kind === "eye") {
          targetX = layout.eyeX;
          targetY = layout.eyeY;
          kindClass = "hero-falling-card--eye";
        } else if (layout.kind === "nose") {
          targetX = layout.noseX;
          targetY = layout.noseY;
          kindClass = "hero-falling-card--nose";
        } else {
          targetX = layout.smileOffset * SMILE_SPREAD_PER_OFFSET;
          targetY = layout.smileOffset * layout.smileOffset * -SMILE_LIFT_PER_OFFSET;
          targetRotate = layout.smileOffset * SMILE_ROTATE_PER_OFFSET;
        }
        const entrySide = targetX < 0 ? -1 : 1;
        return (
          <span
            className={`hero-falling-card${kindClass ? ` ${kindClass}` : ""}`}
            key={`${src}-${index}`}
            data-index={index}
            data-kind={layout.kind}
            style={{
              "--fall-index": index,
              "--arrival": arrivalOrder[index] ?? index,
              "--entry-side": entrySide,
              "--smile-spread": `${targetX}vw`,
              "--smile-lift": `${targetY}rem`,
              "--smile-rotate": `${targetRotate}deg`
            } as CSSProperties}
          >
            <span className="hero-falling-card-inner">
              <Image src={src} alt="" width={170} height={112} sizes="160px" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function KnowledgeHeroOverlay({
  navRef,
  isReady = true,
  showImages = true
}: {
  navRef?: Ref<HTMLElement>;
  isReady?: boolean;
  showImages?: boolean;
}) {
  const [isMusicOpen, setIsMusicOpen] = useState(false);

  return (
    <div className={`knowledge-hero knowledge-hero--overlay ${isReady ? "knowledge-hero--ready" : ""}`} dir="rtl" aria-label="תחום ניהול הידע">
      {showImages ? <FallingHeroImages isReady={isReady} /> : null}
      <KnowledgeHeroNav navRef={navRef} onLogoClick={() => setIsMusicOpen((current) => !current)} />
      <HeroLogoMusicReveal isOpen={isMusicOpen} />
      <KnowledgeHeroCopy />
      <ProjectLogoMarquee />
    </div>
  );
}

export default function KnowledgeLandingHero() {
  const [isMusicOpen, setIsMusicOpen] = useState(false);

  return (
    <section className="knowledge-hero knowledge-hero--ready" dir="rtl" aria-label="תחום ניהול הידע">
      <KnowledgeHeroNav onLogoClick={() => setIsMusicOpen((current) => !current)} />
      <HeroLogoMusicReveal isOpen={isMusicOpen} />
      <KnowledgeHeroCopy />
      <ProjectLogoMarquee />
    </section>
  );
}

