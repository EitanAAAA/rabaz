"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, createScope, stagger, utils } from "animejs";
import type { Scope } from "animejs";

gsap.registerPlugin(ScrollTrigger);

const SURFACE_SRC = "/hero-frames/frame_0360.jpg";
const LOGO_SRC = "/hero-frames/logo2 (1).png";
const GREENS = ["#3f9d4f", "#56b85f", "#2f8443", "#6cc36e", "#48a857"];

const TEXT_STAGES: { id: string; lines: string[]; at: number; hold: number; withLogo?: boolean }[] = [
  { id: "t1", lines: ["אנחנו יורדים לשורש", "העניין בכל פרוייקט"], at: 72, hold: 34 },
  { id: "t2", lines: ["עוד קצת"], at: 124, hold: 30 },
  { id: "logo", lines: ["אגב, זה הלוגו שלנו"], at: 170, hold: 32, withLogo: true }
];

type Seg = { d: string; width: number; depth: number; sy: number };
type Leaf = { x: number; y: number; r: number; c: string };

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRootSystem(): Seg[] {
  const rng = mulberry32(20260604);
  const segs: Seg[] = [];

  const grow = (x: number, y: number, angle: number, width: number, length: number, depth: number): void => {
    if (segs.length >= 72 || width < 1.6 || depth > 6 || y > 2480) return;
    const steps = Math.max(3, Math.round(length / 90));
    const stepLen = length / steps;
    let px = x;
    let py = y;
    let a = angle;
    let d = `M${px.toFixed(1)} ${py.toFixed(1)}`;

    for (let i = 0; i < steps; i++) {
      a += (rng() - 0.5) * 0.95;
      a *= 0.86;
      if (px < 150) a += 0.26;
      if (px > 850) a -= 0.26;
      const half = stepLen * 0.5;
      d += ` Q${(px + Math.sin(a) * half).toFixed(1)} ${(py + Math.cos(a) * half).toFixed(1)} ${(px + Math.sin(a) * stepLen).toFixed(1)} ${(py + Math.cos(a) * stepLen).toFixed(1)}`;
      px += Math.sin(a) * stepLen;
      py += Math.cos(a) * stepLen;
      if (depth < 5 && i >= 1 && rng() < 0.18 + depth * 0.05) {
        const dir = rng() < 0.5 ? -1 : 1;
        grow(px, py, a + dir * (0.5 + rng() * 0.65), width * (0.5 + rng() * 0.18), length * (0.5 + rng() * 0.22), depth + 1);
      }
    }
    segs.push({ d, width, depth, sy: y });
    grow(px, py, a, width * 0.64, length * 0.62, depth + 1);
  };

  grow(500, -40, 0, 17, 840, 0);
  grow(452, -12, -0.55, 11, 560, 1);
  grow(556, -12, 0.55, 11, 560, 1);
  grow(500, 200, 0, 9, 540, 2);
  return segs.sort((p, q) => p.depth - q.depth || p.sy - q.sy);
}

function buildTree(): { branches: Seg[]; leaves: Leaf[] } {
  const rng = mulberry32(91);
  const branches: Seg[] = [];
  const leaves: Leaf[] = [];

  const grow = (x: number, y: number, angle: number, width: number, length: number, depth: number): void => {
    if (branches.length >= 56 || width < 2.2 || depth > 5 || y > 1180) return;
    const steps = Math.max(3, Math.round(length / 70));
    const stepLen = length / steps;
    let px = x;
    let py = y;
    let a = angle;
    let d = `M${px.toFixed(1)} ${py.toFixed(1)}`;

    for (let i = 0; i < steps; i++) {
      a += (rng() - 0.5) * 0.7;
      a *= 0.9;
      if (px < 140) a += 0.2;
      if (px > 860) a -= 0.2;
      const half = stepLen * 0.5;
      d += ` Q${(px + Math.sin(a) * half).toFixed(1)} ${(py + Math.cos(a) * half).toFixed(1)} ${(px + Math.sin(a) * stepLen).toFixed(1)} ${(py + Math.cos(a) * stepLen).toFixed(1)}`;
      px += Math.sin(a) * stepLen;
      py += Math.cos(a) * stepLen;
      if (depth < 4 && i >= 1 && rng() < 0.34) {
        const dir = rng() < 0.5 ? -1 : 1;
        grow(px, py, a + dir * (0.45 + rng() * 0.55), width * 0.62, length * 0.6, depth + 1);
      }
      if (depth >= 2 && rng() < 0.5) leaves.push({ x: px, y: py, r: 16 + rng() * 28, c: GREENS[Math.floor(rng() * GREENS.length)] });
    }
    branches.push({ d, width, depth, sy: y });
    if (depth >= 2) leaves.push({ x: px, y: py, r: 18 + rng() * 32, c: GREENS[Math.floor(rng() * GREENS.length)] });
    grow(px, py, a, width * 0.66, length * 0.6, depth + 1);
  };

  grow(500, 0, 0, 40, 430, 0);
  return { branches: branches.sort((p, q) => p.depth - q.depth), leaves };
}

const ROOT_SEGMENTS = buildRootSystem();
const TREE = buildTree();

const rootStroke = (w: number): string => (w > 10 ? "#8f6a3a" : w > 5 ? "#a87e46" : "#bd9258");
const treeStroke = (w: number): string => (w > 18 ? "#5a3d22" : w > 8 ? "#6b4a28" : "#7c562f");

class RootDiveController {
  private ctx: gsap.Context | null = null;
  private scope: Scope | null = null;

  mount(ref: RefObject<HTMLElement>, reduceMotion: boolean): void {
    const section = ref.current;
    if (!section) return;

    if (reduceMotion) {
      this.renderStaticDeep(section);
      return;
    }

    this.ctx = gsap.context(() => {
      this.buildDive(section);
      this.buildAmbientDrift();
    }, section);

    this.scope = createScope({ root: ref }).add(() => this.buildCanopyLife());
  }

  private buildDive(section: HTMLElement): void {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 34}`,
        scrub: 1.4,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    this.buildSurface(tl);
    this.buildEarth(tl);
    this.buildRoots(tl, section);
    TEXT_STAGES.forEach((stage) => this.addTextStage(tl, `[data-stage="${stage.id}"]`, stage.at, stage.hold, stage.withLogo));
    this.buildReveal(tl, section);
  }

  private buildSurface(tl: gsap.core.Timeline): void {
    tl.fromTo(".roots__photo", { yPercent: 0 }, { yPercent: -92, duration: 30, ease: "none" }, 0);
    tl.to(".roots__photo", { opacity: 0, duration: 7, ease: "power1.in" }, 24);
    tl.to(".roots__blend", { opacity: 0, duration: 10 }, 4);
  }

  private buildEarth(tl: gsap.core.Timeline): void {
    tl.to(".roots__earth--a", { opacity: 0, duration: 26 }, 28)
      .to(".roots__earth--b", { opacity: 1, duration: 26 }, 28)
      .to(".roots__earth--b", { opacity: 0, duration: 35 }, 60)
      .to(".roots__earth--c", { opacity: 1, duration: 35 }, 60)
      .to(".roots__earth--c", { opacity: 0, duration: 50 }, 115)
      .to(".roots__earth--d", { opacity: 1, duration: 50 }, 115);

    tl.to(".roots__vignette", { opacity: 1, duration: 70 }, 110);
  }

  private buildRoots(tl: gsap.core.Timeline, section: HTMLElement): void {
    const paths = gsap.utils.toArray<SVGPathElement>(section.querySelectorAll(".roots__svg path"));
    const n = Math.max(1, paths.length);
    paths.forEach((path, i) => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(path, { strokeDashoffset: 0, duration: 44, ease: "none" }, 26 + (i / n) * 166);
    });

    tl.fromTo(".roots__svgwrap", { yPercent: 12, scale: 1.02 }, { yPercent: -38, scale: 1.2, duration: 214, ease: "none" }, 16);
  }

  private addTextStage(tl: gsap.core.Timeline, selector: string, at: number, hold: number, withLogo = false): void {
    tl.fromTo(selector, { autoAlpha: 0 }, { autoAlpha: 1, duration: 8, ease: "power2.out" }, at);
    tl.fromTo(
      `${selector} .dive-char`,
      { yPercent: 120, opacity: 0, rotate: 5 },
      { yPercent: 0, opacity: 1, rotate: 0, duration: 11, ease: "power3.out", stagger: 0.18 },
      at
    );
    if (withLogo) {
      tl.fromTo(
        `${selector} .dive-logo`,
        { autoAlpha: 0, scale: 0.7, yPercent: 26, rotate: -6 },
        { autoAlpha: 1, scale: 1, yPercent: 0, rotate: 0, duration: 11, ease: "back.out(1.4)" },
        at + 1
      );
    }
    tl.to(selector, { autoAlpha: 0, yPercent: -42, duration: 9, ease: "power2.in" }, at + hold);
  }

  private buildReveal(tl: gsap.core.Timeline, section: HTMLElement): void {
    const branches = gsap.utils.toArray<SVGPathElement>(section.querySelectorAll(".roots__treebranch"));
    tl.to(".roots__tree", { opacity: 1, duration: 8 }, 206);
    branches.forEach((branch, i) => {
      const len = branch.getTotalLength();
      gsap.set(branch, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(branch, { strokeDashoffset: 0, duration: 12, ease: "none" }, 206 + i * 0.5);
    });
    tl.fromTo(".roots__leaf", { opacity: 0 }, { opacity: 1, duration: 10, ease: "power2.out", stagger: 0.1 }, 215);
    tl.fromTo(".roots__card", { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 14, ease: "power3.out" }, 216);
  }

  private buildAmbientDrift(): void {
    gsap.to(".roots__svg", { x: 10, repeat: -1, yoyo: true, duration: 9, ease: "sine.inOut" });
    gsap.to(".roots__deepglow", { x: -24, scale: 1.08, repeat: -1, yoyo: true, duration: 14, ease: "sine.inOut" });
  }

  private buildCanopyLife(): void {
    animate(".roots__tree", { rotate: [-1.1, 1.1], duration: 6400, alternate: true, loop: true, ease: "inOutSine" });
    animate(".roots__leaf", {
      scale: [0.86, 1.08],
      duration: () => utils.random(2200, 3800),
      delay: stagger(80),
      alternate: true,
      loop: true,
      ease: "inOutSine"
    });
  }

  private renderStaticDeep(section: HTMLElement): void {
    const set = (selector: string, styles: Partial<CSSStyleDeclaration>) =>
      section.querySelectorAll<HTMLElement>(selector).forEach((el) => Object.assign(el.style, styles));

    set(".roots__photo", { opacity: "0" });
    set(".roots__earth--a", { opacity: "0" });
    set(".roots__earth--b", { opacity: "0" });
    set(".roots__earth--c", { opacity: "0" });
    set(".roots__earth--d", { opacity: "1" });
    set(".roots__blend", { opacity: "0" });
    set(".roots__vignette", { opacity: "1" });
    set(".roots__svg path", { strokeDashoffset: "0" });
    set(".roots__tree", { opacity: "1" });
    set(".roots__treebranch", { strokeDashoffset: "0" });
    set(".roots__leaf", { opacity: "1" });
    set(".roots__card", { opacity: "1", transform: "translateY(0)" });
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

export default function RootsDescentSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = new RootDiveController();
    controller.mount(sectionRef, reduceMotion);
    return () => controller.destroy();
  }, []);

  return (
    <section ref={sectionRef} className="roots" dir="rtl" aria-label="צוללים לשורש העניין">
      <div className="roots__earth roots__earth--a" aria-hidden="true" />
      <div className="roots__earth roots__earth--b" aria-hidden="true" />
      <div className="roots__earth roots__earth--c" aria-hidden="true" />
      <div className="roots__earth roots__earth--d" aria-hidden="true" />

      <div className="roots__photo" aria-hidden="true" style={{ backgroundImage: `url(${encodeURI(SURFACE_SRC)})` }} />

      <div className="roots__deepglow" aria-hidden="true" />

      <div className="roots__svgwrap" aria-hidden="true">
        <svg className="roots__svg" viewBox="0 0 1000 2400" fill="none" preserveAspectRatio="xMidYMin slice">
          {ROOT_SEGMENTS.map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              strokeWidth={seg.width.toFixed(1)}
              stroke={rootStroke(seg.width)}
              style={{ opacity: seg.width > 4 ? 1 : 0.88 }}
            />
          ))}
        </svg>
      </div>

      <div className="roots__tree" aria-hidden="true">
        <svg viewBox="0 0 1000 1180" fill="none" preserveAspectRatio="xMidYMin meet">
          {TREE.branches.map((b, i) => (
            <path key={`b${i}`} className="roots__treebranch" d={b.d} strokeWidth={b.width.toFixed(1)} stroke={treeStroke(b.width)} />
          ))}
          {TREE.leaves.map((leaf, i) => (
            <circle key={`l${i}`} className="roots__leaf" cx={leaf.x.toFixed(1)} cy={leaf.y.toFixed(1)} r={leaf.r.toFixed(1)} fill={leaf.c} />
          ))}
        </svg>
      </div>

      {TEXT_STAGES.map((stage) => (
        <div key={stage.id} className={`dive-stage${stage.withLogo ? " dive-stage--logo" : ""}`} data-stage={stage.id}>
          {stage.withLogo && <img className="dive-logo" src={encodeURI(LOGO_SRC)} alt="הלוגו שלנו" />}
          {stage.lines.map((line) => (
            <DiveLine key={line} text={line} />
          ))}
        </div>
      ))}

      <div className="roots__vignette" aria-hidden="true" />
      <div className="roots__blend" aria-hidden="true" />

      <footer className="roots__card">
        <h2 className="roots__bigtext">
          <span>ביצוע מהשורש</span>
          <span>זה אנחנו</span>
        </h2>

        <div className="roots__credit">
          <span>© 2026 הרבנות הצבאית — כל הזכויות שמורות</span>
          <span className="roots__tag">לשורש · לעומק · לאמת</span>
        </div>
      </footer>
    </section>
  );
}
