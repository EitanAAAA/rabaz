"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, createTimer } from "animejs";
import type { Timer } from "animejs";
import { branchesCatalog } from "@/lib/branches/BranchesCatalog";
import type { BranchItem } from "@/lib/branches/BranchItem";

gsap.registerPlugin(ScrollTrigger);

const CYCLE_MS = 3000;
const CARD_COUNT = 8;

class BranchesShowcaseController {
  private section!: HTMLElement;
  private grid!: HTMLElement;
  private cards: HTMLElement[] = [];
  private readonly branches = branchesCatalog.getAll();
  private triggers: ScrollTrigger[] = [];
  private timer: Timer | null = null;
  private offset = 0;
  private hovering = false;

  mount(section: HTMLElement, reduceMotion: boolean): void {
    this.section = section;
    this.grid = section.querySelector<HTMLElement>("[data-grid]")!;
    this.cards = Array.from(section.querySelectorAll<HTMLElement>("[data-card]"));
    this.bindHover();

    if (reduceMotion) {
      gsap.set(section.querySelectorAll("[data-reveal]"), { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      return;
    }

    this.buildReveal();
    this.startCycle();
  }

  private branchFor(cardIndex: number): BranchItem {
    const len = this.branches.length;
    return this.branches[(cardIndex + this.offset) % len];
  }

  // Slide each card's branch out then in — a smooth swap, no flip.
  private rotate(): void {
    this.cards.forEach((card, i) => {
      const branch = this.branchFor(i);
      const nameEl = card.querySelector<HTMLElement>("[data-name]");
      if (!nameEl) return;

      animate(nameEl, {
        opacity: [1, 0],
        translateY: [0, -12],
        duration: 240,
        delay: i * 50,
        ease: "in(2)",
        onComplete: () => {
          this.writeBranch(card, branch);
          animate(nameEl, { opacity: [0, 1], translateY: [14, 0], duration: 420, ease: "out(3)" });
        }
      });
    });
  }

  private writeBranch(card: HTMLElement, branch: BranchItem): void {
    const set = (selector: string, text: string) => {
      const el = card.querySelector<HTMLElement>(selector);
      if (el) el.textContent = text;
    };
    set("[data-name]", branch.name);
    set("[data-count]", String(branch.projectCount));
    set("[data-count-label]", branch.projectLabel);
    card.dataset.cardCount = String(branch.projectCount);

    const list = card.querySelector<HTMLElement>("[data-projects]");
    if (list) {
      list.replaceChildren(
        ...branch.projects.map((project) => {
          const li = document.createElement("li");
          li.textContent = project;
          return li;
        })
      );
    }
  }

  private startCycle(): void {
    this.timer = createTimer({
      duration: CYCLE_MS,
      loop: true,
      onLoop: () => {
        if (this.hovering) return;
        this.offset = (this.offset + 1) % this.branches.length;
        this.rotate();
      }
    });
  }

  private bindHover(): void {
    this.grid.addEventListener("pointerenter", () => {
      this.hovering = true;
      this.timer?.pause();
    });
    this.grid.addEventListener("pointerleave", () => {
      this.hovering = false;
      this.timer?.play();
    });

    this.cards.forEach((card) => {
      card.addEventListener("pointerenter", () => this.countUp(card));
    });
  }

  // Count the project total up from zero each time the cube opens.
  private countUp(card: HTMLElement): void {
    const value = card.querySelector<HTMLElement>("[data-count]");
    const target = Number(card.dataset.cardCount ?? 0);
    if (!value) return;
    const counter = { val: 0 };
    animate(counter, {
      val: target,
      duration: 620,
      ease: "out(3)",
      onUpdate: () => {
        value.textContent = String(Math.round(counter.val));
      }
    });
  }

  private buildReveal(): void {
    const reveals = this.section.querySelectorAll<HTMLElement>("[data-reveal]");
    gsap.set(reveals, { autoAlpha: 0, y: 56, filter: "blur(12px)" });

    this.triggers.push(
      ScrollTrigger.create({
        trigger: this.section,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(reveals, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.06
          });
        }
      })
    );
  }

  destroy(): void {
    this.triggers.forEach((trigger) => trigger.kill());
    this.triggers = [];
    this.timer?.revert();
    this.timer = null;
  }
}

export default function BranchesShowcaseSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const branches = branchesCatalog.getAll();
  const initial = branches.slice(0, CARD_COUNT);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = new BranchesShowcaseController();
    controller.mount(section, reduceMotion);

    return () => controller.destroy();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="branches"
      className="branches-showcase"
      dir="rtl"
      aria-label="הענפים שאיתם אנחנו עובדים"
    >
      <header className="branches-showcase__header">
        <p className="branches-showcase__eyebrow" data-reveal>
          תחומי הפעילות
        </p>
        <h2 className="branches-showcase__title" data-reveal>
          הענפים שאיתם אנחנו עובדים
        </h2>
        <p className="branches-showcase__lead" data-reveal>
          {branchesCatalog.getCount()} ענפים מתחלפים על הכרטיסים — רחפו על כרטיס כדי לפתוח אותו ולראות את כל הפרויקטים שבנינו לאותו ענף.
        </p>
      </header>

      <div className="branches-showcase__grid" data-grid data-reveal>
        {initial.map((branch) => (
          <article
            key={branch.id}
            className="branch-card"
            data-card
            data-card-count={branch.projectCount}
          >
            <div className="branch-card__body">
              <span className="branch-card__name" data-name>
                {branch.name}
              </span>
              <span className="branch-card__tag">ענף</span>

              <div className="branch-card__detail" aria-hidden="true">
                <span className="branch-card__count" data-count>
                  {branch.projectCount}
                </span>
                <span className="branch-card__count-label" data-count-label>
                  {branch.projectLabel}
                </span>
                <ul className="branch-card__projects" data-projects>
                  {branch.projects.map((project) => (
                    <li key={project}>{project}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
