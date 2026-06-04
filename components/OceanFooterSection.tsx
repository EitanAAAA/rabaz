"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, createScope, stagger, utils } from "animejs";
import type { Scope } from "animejs";

gsap.registerPlugin(ScrollTrigger);

const LOGO_SRC = "/hero-frames/logo2 (1).png";

const FLOAT_WORDS = ["כך", "אנחנו", "בונים", "פרויקטים", "מושלמים", "לעומק"];

// Each phrase enters from the bottom with a character-spread reveal, holds long, then rises out the top.
const TEXT_STAGES: { id: string; text: string; at: number }[] = [
  { id: "t1", text: "אנחנו צוללים עמוק לתוך פרויקט", at: 22 },
  { id: "t2", text: "יותר עמוק", at: 78 },
  { id: "t3", text: "עוד קצת", at: 134 }
];

const LOGO_AT = 190;
const WORDS_AT = 240;

class OceanDiveController {
  private ctx: gsap.Context | null = null;
  private scope: Scope | null = null;

  // Reuses the page's existing Lenis (driven by GSAP's ticker) — never spawns a second one.
  mount(ref: RefObject<HTMLElement>, reduceMotion: boolean): void {
    const section = ref.current;
    if (!section) return;

    this.spawnDrift(section, reduceMotion);

    if (reduceMotion) {
      this.renderStaticDark(section);
      return;
    }

    this.ctx = gsap.context(() => {
      this.buildDive(section);
      this.buildAmbientDrift();
    }, section);

    this.scope = createScope({ root: ref }).add(() => this.buildSeaLife());
  }

  // One very long pinned, scrubbed descent that carries every stage of the story with lots of space between.
  private buildDive(section: HTMLElement): void {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 30}`,
        scrub: 1.4,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    this.buildWater(tl);
    this.buildAtmosphere(tl);

    TEXT_STAGES.forEach((stage) => this.addTextStage(section, tl, `[data-stage="${stage.id}"]`, stage.at));
    this.addTextStage(section, tl, '[data-stage="logo"]', LOGO_AT, true);
    this.buildWordFloat(tl, WORDS_AT);
    this.buildReveal(tl);
  }

  // The slow light → teal → deep → abyss crossfade, stretched over the whole descent.
  private buildWater(tl: gsap.core.Timeline): void {
    tl.to(".ocean-footer__water--a", { opacity: 0, duration: 28 }, 8)
      .to(".ocean-footer__water--b", { opacity: 1, duration: 28 }, 8)
      .to(".ocean-footer__water--b", { opacity: 0, duration: 32 }, 46)
      .to(".ocean-footer__water--c", { opacity: 1, duration: 32 }, 46)
      .to(".ocean-footer__water--c", { opacity: 0, duration: 34 }, 92)
      .to(".ocean-footer__water--d", { opacity: 1, duration: 34 }, 92);

    tl.to(".ocean-footer__blend", { opacity: 0, duration: 8 }, 2);
    tl.to(".o-vignette", { opacity: 1, duration: 44 }, 115);
  }

  // Surface light, rays, caustics, glow and drifting particles — all slowed for the long fall.
  private buildAtmosphere(tl: gsap.core.Timeline): void {
    tl.to(".o-surface", { yPercent: -44, opacity: 0.5, scale: 0.9, duration: 26 }, 8)
      .to(".o-surface", { yPercent: -125, opacity: 0, scale: 0.6, duration: 34 }, 44);

    tl.to(".o-rays", { opacity: 0.46, yPercent: 30, scale: 1.32, duration: 28 }, 8)
      .to(".o-rays", { opacity: 0, yPercent: 125, scale: 1.95, duration: 34 }, 48);

    tl.to(".o-caustics", { opacity: 0.5, scale: 1.6, yPercent: 30, duration: 28 }, 12)
      .to(".o-caustics", { opacity: 0, scale: 2.4, yPercent: 120, duration: 34 }, 52);

    tl.to(".o-deepglow", { opacity: 0.46, scale: 1.3, duration: 30 }, 70)
      .to(".o-deepglow", { opacity: 0.22, scale: 1.72, duration: 40 }, 150);

    tl.to(".o-bubbles", { opacity: 0.5, duration: 18 }, 10).to(".o-bubbles", { opacity: 0.16, duration: 26 }, 90);
    tl.to(".o-particles", { opacity: 0.82, duration: 22 }, 16).to(".o-particles", { opacity: 0.46, duration: 40 }, 130);

    tl.to(".o-fishlayer", { opacity: 0.9, duration: 22 }, 40);
  }

  // A phrase that forms from the bottom (chars spread → converge), holds for a long while, then floats up and out.
  private addTextStage(section: HTMLElement, tl: gsap.core.Timeline, selector: string, at: number, withLogo = false): void {
    const chars = section.querySelectorAll<HTMLElement>(`${selector} .dive-char`);
    if (!chars.length) return;
    const center = (chars.length - 1) / 2;

    tl.fromTo(selector, { autoAlpha: 0, yPercent: 48 }, { autoAlpha: 1, yPercent: 0, duration: 9, ease: "power2.out" }, at);

    tl.fromTo(
      `${selector} .dive-char`,
      {
        x: (i: number) => (i - center) * 52,
        rotate: (i: number) => (i - center) * 14,
        y: (i: number) => Math.abs(i - center) * 28,
        opacity: 0
      },
      { x: 0, rotate: 0, y: 0, opacity: 1, duration: 9, ease: "power3.out" },
      at
    );

    if (withLogo) {
      tl.fromTo(
        `${selector} .dive-logo`,
        { autoAlpha: 0, scale: 0.7, yPercent: 24, rotate: -6 },
        { autoAlpha: 1, scale: 1, yPercent: 0, rotate: 0, duration: 9, ease: "back.out(1.4)" },
        at + 1
      );
    }

    tl.to(selector, { autoAlpha: 0, yPercent: -48, duration: 9, ease: "power2.in" }, at + 22);
  }

  // Words about how we build, drifting in one by one, then clearing for the footer.
  private buildWordFloat(tl: gsap.core.Timeline, at: number): void {
    tl.fromTo(
      ".dive-word",
      { autoAlpha: 0, scale: 0.55, y: 70 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 7, ease: "power3.out", stagger: 1.6 },
      at
    );
    tl.to(".dive-word", { autoAlpha: 0, y: -60, duration: 7, ease: "power2.in", stagger: 0.9 }, at + 24);
  }

  private buildReveal(tl: gsap.core.Timeline): void {
    tl.to(".o-floor", { y: 0, bottom: 0, opacity: 1, duration: 14, ease: "power3.out" }, 262);
    tl.to(".ocean-footer__card", { y: 0, opacity: 1, duration: 8, ease: "power3.out" }, 276);
  }

  // Endless gentle drift of light, glow and the floating words.
  private buildAmbientDrift(): void {
    gsap.to(".o-surface", { x: 26, repeat: -1, yoyo: true, duration: 12, ease: "sine.inOut" });
    gsap.to(".o-deepglow", { x: -30, repeat: -1, yoyo: true, duration: 15, ease: "sine.inOut" });
    gsap.to(".o-caustics", { xPercent: 8, rotate: 1.5, repeat: -1, yoyo: true, duration: 13, ease: "sine.inOut" });
    gsap.to(".dive-word", { x: "+=16", rotate: 2.5, repeat: -1, yoyo: true, duration: 6, ease: "sine.inOut" });
  }

  // anime.js: swimming fish, pulsing jellyfish and the swaying reef — all scoped to the section root.
  private buildSeaLife(): void {
    this.swimSchool();
    this.pulseJellies();
    this.swayReef();
  }

  // Fish crossing the screen on loops; scaleX flips the ones swimming the other way.
  private swimSchool(): void {
    const swim = (sel: string, fromX: string, toX: string, ys: number[], dur: number, delay: number, size: number) =>
      animate(sel, {
        x: [fromX, toX],
        y: ys,
        scaleX: [size, size],
        scaleY: [Math.abs(size), Math.abs(size)],
        loop: true,
        duration: dur,
        delay,
        ease: "linear"
      });

    swim(".o-fish.one", "-18vw", "118vw", [0, -24, 10, -6, 0], 17000, 0, 0.85);
    swim(".o-fish.two", "118vw", "-18vw", [0, 20, -14, 8, 0], 21000, 1500, -0.6);
    swim(".o-fish.three", "-22vw", "120vw", [0, 16, -22, 0], 26000, 3000, 0.5);
    swim(".o-fish.four", "120vw", "-22vw", [0, -18, 12, 0], 30000, 800, -0.42);
    swim(".o-fish.five", "-20vw", "118vw", [0, -30, 0], 23000, 5000, 0.7);
    swim(".o-fish.six", "118vw", "-20vw", [0, 24, -12, 0], 34000, 2500, -0.55);
  }

  private pulseJellies(): void {
    animate(".o-jelly", {
      scaleY: [1, 0.8, 1],
      scaleX: [1, 1.12, 1],
      y: [0, -26, 0],
      opacity: [0.4, 0.7, 0.4],
      duration: () => utils.random(4200, 6200),
      delay: stagger(500),
      loop: true,
      ease: "inOutSine"
    });
  }

  private swayReef(): void {
    animate(".o-coral", {
      rotate: () => utils.random(-8, 8),
      scaleY: () => 0.96 + Math.random() * 0.07,
      duration: () => utils.random(2800, 4200),
      delay: stagger(220),
      alternate: true,
      loop: true,
      ease: "inOutSine"
    });
    animate(".o-branch", {
      rotate: () => utils.random(8, 40),
      duration: () => utils.random(2400, 3800),
      delay: stagger(180),
      alternate: true,
      loop: true,
      ease: "inOutSine"
    });
    animate(".o-seaweed", {
      rotate: () => utils.random(-7, 7),
      scaleY: () => 0.96 + Math.random() * 0.08,
      duration: () => utils.random(3200, 5200),
      alternate: true,
      loop: true,
      ease: "inOutSine"
    });
    animate(".o-anemone", {
      scale: () => 0.82 + Math.random() * 0.18,
      rotate: () => utils.random(-6, 6),
      duration: () => utils.random(2600, 4400),
      alternate: true,
      loop: true,
      ease: "inOutSine"
    });
    animate(".o-glow", {
      opacity: [0.22, 0.95],
      scale: [0.65, 1.35],
      duration: () => utils.random(1800, 3200),
      delay: stagger(280),
      alternate: true,
      loop: true,
      ease: "inOutSine"
    });
  }

  private spawnDrift(section: HTMLElement, reduceMotion: boolean): void {
    const bubbles = section.querySelector<HTMLElement>("[data-bubbles]");
    const particles = section.querySelector<HTMLElement>("[data-particles]");
    if (reduceMotion || !bubbles || !particles) return;

    for (let i = 0; i < 24; i++) {
      const bubble = document.createElement("span");
      bubble.className = "o-bubble";
      const size = 8 + Math.random() * 22;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${14 + Math.random() * 18}s`;
      bubble.style.animationDelay = `${Math.random() * 16}s`;
      bubble.style.setProperty("--drift", `${Math.random() * 110 - 55}px`);
      bubbles.appendChild(bubble);
    }

    for (let i = 0; i < 110; i++) {
      const particle = document.createElement("span");
      particle.className = "o-particle";
      const size = 1 + Math.random() * 2.2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${6 + Math.random() * 10}s`;
      particle.style.animationDelay = `${Math.random() * 9}s`;
      particles.appendChild(particle);
    }
  }

  private renderStaticDark(section: HTMLElement): void {
    const set = (selector: string, styles: Partial<CSSStyleDeclaration>) =>
      section.querySelectorAll<HTMLElement>(selector).forEach((el) => Object.assign(el.style, styles));

    set(".ocean-footer__water--a", { opacity: "0" });
    set(".ocean-footer__water--b", { opacity: "0" });
    set(".ocean-footer__water--c", { opacity: "0" });
    set(".ocean-footer__water--d", { opacity: "1" });
    set(".o-vignette", { opacity: "1" });
    set(".ocean-footer__blend", { opacity: "0" });
    set(".o-floor", { opacity: "1", bottom: "0px", transform: "translateY(0)" });
    set(".ocean-footer__card", { opacity: "1", transform: "translateX(-50%) translateY(0)" });
  }

  destroy(): void {
    this.ctx?.revert();
    this.ctx = null;
    this.scope?.revert();
    this.scope = null;
  }
}

function DiveLine({ text }: { text: string }) {
  return (
    <h3 className="dive-line" aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="dive-char" aria-hidden="true">
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </h3>
  );
}

export default function OceanFooterSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = new OceanDiveController();
    controller.mount(sectionRef, reduceMotion);
    return () => controller.destroy();
  }, []);

  return (
    <section ref={sectionRef} className="ocean-footer" dir="rtl" aria-label="סיום ופוטר">
      <div className="ocean-footer__water ocean-footer__water--a" aria-hidden="true" />
      <div className="ocean-footer__water ocean-footer__water--b" aria-hidden="true" />
      <div className="ocean-footer__water ocean-footer__water--c" aria-hidden="true" />
      <div className="ocean-footer__water ocean-footer__water--d" aria-hidden="true" />

      <div className="o-deepglow" aria-hidden="true" />
      <div className="o-surface" aria-hidden="true" />
      <div className="o-rays" aria-hidden="true" />
      <div className="o-caustics" aria-hidden="true" />

      <div className="o-particles" data-particles aria-hidden="true" />
      <div className="o-bubbles" data-bubbles aria-hidden="true" />

      <div className="o-fishlayer" aria-hidden="true">
        <span className="o-fish one" />
        <span className="o-fish two" />
        <span className="o-fish three" />
        <span className="o-fish four" />
        <span className="o-fish five" />
        <span className="o-fish six" />
        <span className="o-jelly one" />
        <span className="o-jelly two" />
      </div>

      {TEXT_STAGES.map((stage) => (
        <div key={stage.id} className="dive-stage" data-stage={stage.id}>
          <DiveLine text={stage.text} />
        </div>
      ))}

      <div className="dive-stage dive-stage--logo" data-stage="logo">
        <img className="dive-logo" src={encodeURI(LOGO_SRC)} alt="הלוגו שלנו" />
        <DiveLine text="אגב, זה הלוגו שלנו" />
      </div>

      <div className="dive-wordfloat" aria-label="כך אנחנו בונים פרויקטים מושלמים">
        {FLOAT_WORDS.map((word, i) => (
          <span key={word} className={`dive-word dive-word--${i + 1}`} aria-hidden="true">
            {word}
          </span>
        ))}
      </div>

      <div className="o-floor" aria-hidden="true">
        <div className="o-sand" />

        <div className="o-rock one" />
        <div className="o-rock two" />
        <div className="o-rock three" />
        <div className="o-rock four" />

        <div className="o-coral one">
          <span className="o-branch" />
        </div>
        <div className="o-coral two">
          <span className="o-branch" />
        </div>
        <div className="o-coral three">
          <span className="o-branch" />
        </div>
        <div className="o-coral four">
          <span className="o-branch" />
        </div>

        <div className="o-seaweed one" />
        <div className="o-seaweed two" />
        <div className="o-seaweed three" />
        <div className="o-seaweed four" />

        <div className="o-anemone one" />
        <div className="o-anemone two" />

        <div className="o-glow one" />
        <div className="o-glow two" />
        <div className="o-glow three" />
        <div className="o-glow four" />
      </div>

      <div className="o-vignette" aria-hidden="true" />
      <div className="ocean-footer__blend" aria-hidden="true" />

      <footer className="ocean-footer__card">
        <h2 className="ocean-footer__headline">
          <span>עבודה עמוקה</span>
          <span>זה אנחנו</span>
        </h2>

        <div className="ocean-footer__bottom">
          <span>© 2026 הרבנות הצבאית — כל הזכויות שמורות</span>
          <span className="ocean-footer__tag">עבודה עמוקה · פוקוס · עומק</span>
        </div>
      </footer>
    </section>
  );
}
