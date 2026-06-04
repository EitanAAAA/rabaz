"use client";

import Image from "next/image";
import { useState } from "react";
import type { MouseEvent, Ref } from "react";
import { MusicPlayer } from "@/components/ui/music-player";
import { TextAnimate } from "@/components/ui/text-animate";
import { scrollToSection } from "@/lib/smoothScroll";

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

function KnowledgeHeroNav({
  navRef,
  onLogoClick
}: {
  navRef?: Ref<HTMLElement>;
  onLogoClick?: () => void;
}) {
  const goTo = (target: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(target);
  };

  return (
    <header ref={navRef} className="knowledge-hero-nav">
      <nav className="knowledge-hero-tabs" aria-label="ניווט ראשי">
        <a href="#home" onClick={goTo("#home")}><TextAnimate animation="blurInUp" by="word">בית</TextAnimate></a>
        <a href="#work" onClick={goTo("#work")}><TextAnimate animation="blurInUp" by="word">פרויקטים</TextAnimate></a>
        <a href="#branches" onClick={goTo("#branches")}><TextAnimate animation="blurInUp" by="word">ענפים</TextAnimate></a>
        <a href="#structure" onClick={goTo("#structure")}><TextAnimate animation="blurInUp" by="word">מבנה</TextAnimate></a>
      </nav>

      <button className="knowledge-hero-brand" type="button" aria-label="פתח נגן מוזיקה" onClick={onLogoClick}>
        <Image src="/logo-hover-player.png" alt="" width={52} height={52} priority />
        <span><TextAnimate animation="blurInUp" by="word">רבנות צבאית</TextAnimate></span>
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

export function KnowledgeHeroOverlay({
  navRef,
  isReady = true
}: {
  navRef?: Ref<HTMLElement>;
  isReady?: boolean;
}) {
  const [isMusicOpen, setIsMusicOpen] = useState(false);

  return (
    <div className={`knowledge-hero knowledge-hero--overlay ${isReady ? "knowledge-hero--ready" : ""}`} dir="rtl" aria-label="תחום ניהול הידע">
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

