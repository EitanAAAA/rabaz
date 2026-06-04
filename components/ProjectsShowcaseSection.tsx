"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProjectShowcaseCard } from "@/components/projects/ProjectShowcaseCard";
import TeamShowcase from "@/components/TeamShowcase";
import { projectsCatalog } from "@/lib/projects/ProjectsCatalog";

gsap.registerPlugin(ScrollTrigger);

class ProjectsScrollAnimator {
  private triggers: ScrollTrigger[] = [];

  mount(section: HTMLElement, reduceMotion: boolean): void {
    this.populateStatsImmediate(section);

    if (reduceMotion) {
      gsap.set(section.querySelectorAll("[data-reveal]"), { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set(section.querySelectorAll("[data-stat-item]"), { autoAlpha: 1, y: 0 });
      gsap.set(section.querySelectorAll("[data-projects-stack]"), { yPercent: 0 });
      gsap.set(section.querySelectorAll("[data-org-frame]"), { yPercent: 0 });
      return;
    }

    this.animateHeader(section);
    this.buildSequence(section);
  }

  private populateStatsImmediate(section: HTMLElement): void {
    section.querySelectorAll<HTMLElement>("[data-stat-item]").forEach((stat) => {
      const value = stat.querySelector<HTMLElement>("[data-stat-value]");
      const target = Number(stat.getAttribute("data-stat-target") ?? 0);
      if (value) value.textContent = String(target).padStart(2, "0");
    });
  }

  private animateHeader(section: HTMLElement): void {
    const header = section.querySelector<HTMLElement>("[data-projects-header]");
    if (!header) return;

    const revealNodes = header.querySelectorAll<HTMLElement>("[data-reveal]");
    if (revealNodes.length === 0) return;

    gsap.set(revealNodes, { autoAlpha: 0, y: 70, filter: "blur(14px)" });

    this.triggers.push(
      ScrollTrigger.create({
        trigger: header,
        start: "top 95%",
        end: "top 45%",
        scrub: 1,
        animation: gsap.to(revealNodes, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.18,
          ease: "power3.out"
        })
      })
    );
  }

  // One pinned stage: count-up, then project frame slides over numbers + cards scroll,
  // then org frame slides over the projects + team scrolls. A true stacked-scroll sequence.
  private buildSequence(section: HTMLElement): void {
    const stage = section.querySelector<HTMLElement>("[data-stage]");
    const pinBlock = section.querySelector<HTMLElement>("[data-pinblock]");
    const statsRoot = section.querySelector<HTMLElement>("[data-stats-root]");
    const stack = section.querySelector<HTMLElement>("[data-projects-stack]");
    const scroller = section.querySelector<HTMLElement>("[data-projects-scroller]");
    const orgFrame = section.querySelector<HTMLElement>("[data-org-frame]");
    const orgScroller = section.querySelector<HTMLElement>("[data-org-scroller]");
    if (!stage || !pinBlock || !statsRoot || !stack || !scroller || !orgFrame || !orgScroller) return;

    const rows = Array.from(statsRoot.querySelectorAll<HTMLElement>("[data-stat-item]"));
    const formatValue = (n: number) => String(n).padStart(2, "0");

    rows.forEach((row) => {
      const value = row.querySelector<HTMLElement>("[data-stat-value]");
      if (value) value.textContent = "00";
    });

    gsap.set(rows, { autoAlpha: 0, y: 60 });
    gsap.set(stack, { yPercent: 112 });
    gsap.set(orgFrame, { yPercent: 112 });

    const projDistance = () => Math.max(0, scroller.scrollHeight - stack.clientHeight);
    const orgDistance = () => Math.max(0, orgScroller.scrollHeight - orgFrame.clientHeight);

    const master = gsap.timeline();

    master.to(rows, { autoAlpha: 1, y: 0, stagger: 0.1, ease: "power2.out", duration: 0.7 }, 0);

    rows.forEach((row, index) => {
      const value = row.querySelector<HTMLElement>("[data-stat-value]");
      const target = Number(row.getAttribute("data-stat-target") ?? 0);
      if (!value) return;

      const counter = { val: 0 };
      master.to(
        counter,
        {
          val: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            value.textContent = formatValue(Math.round(counter.val));
          }
        },
        index === 0 ? 0.35 : "<+0.3"
      );
    });

    master.to({}, { duration: 1 });
    master.to(stack, { yPercent: 0, ease: "power3.inOut", duration: 1.8 });
    master.to(
      pinBlock,
      { scale: 0.96, transformOrigin: "center top", ease: "power3.inOut", duration: 1.8 },
      "<"
    );
    master.fromTo(
      scroller,
      { y: 0 },
      { y: () => -projDistance(), ease: "none", duration: 3.6 },
      ">"
    );
    master.to({}, { duration: 0.6 });
    master.to(orgFrame, { yPercent: 0, ease: "power3.inOut", duration: 1.8 });
    master.to(
      stack,
      { scale: 0.96, transformOrigin: "center top", ease: "power3.inOut", duration: 1.8 },
      "<"
    );
    master.fromTo(
      orgScroller,
      { y: 0 },
      { y: () => -orgDistance(), ease: "none", duration: 3.4 },
      ">"
    );

    this.triggers.push(
      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * 10}`,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1.1,
        invalidateOnRefresh: true,
        animation: master
      })
    );
  }

  destroy(): void {
    this.triggers.forEach((trigger) => trigger.kill());
    this.triggers = [];
  }
}

export default function ProjectsShowcaseSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const animatorRef = useRef<ProjectsScrollAnimator | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const allProjects = projectsCatalog.getAll();
  const totalCount = projectsCatalog.getCount();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animator = new ProjectsScrollAnimator();
    animatorRef.current = animator;
    animator.mount(section, reduceMotion);

    const spotlight = spotlightRef.current;
    const onMove = (event: PointerEvent) => {
      if (!spotlight || reduceMotion) return;
      const rect = section.getBoundingClientRect();
      spotlight.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      spotlight.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      spotlight.style.opacity = "1";
    };

    const onLeave = () => {
      if (!spotlight) return;
      spotlight.style.opacity = "0";
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    const refresh = () => ScrollTrigger.refresh(true);
    const refreshIds = [0, 400, 1200].map((delay) => window.setTimeout(refresh, delay));

    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(section);
    window.addEventListener("load", refresh);

    return () => {
      refreshIds.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("load", refresh);
      resizeObserver.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      animator.destroy();
      animatorRef.current = null;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="projects-showcase"
      dir="rtl"
      aria-label="תיק הפרויקטים שלנו"
    >
      <div ref={spotlightRef} className="projects-showcase__spotlight" aria-hidden="true" />

      <div className="projects-showcase__stage" data-stage>
        <div className="projects-showcase__pinblock" data-pinblock>
          <div className="projects-showcase__inner">
            <header className="projects-showcase__header" data-projects-header>
              <p className="projects-showcase__eyebrow" data-reveal>
                תיק עבודות
              </p>
              <h2 className="projects-showcase__title knowledge-title" data-reveal>
                <span>כל הפרויקטים</span>
                <span>שבנינו יחד</span>
              </h2>
              <p className="projects-showcase__lead" data-reveal>
                מערכות, אפליקציות וחוויות דיגיטליות שמשרתות את הרבנות הצבאית — ממוקאפים עד מוצר חי בשטח.
              </p>
            </header>
          </div>

          <div className="projects-stats" data-stats-root>
            {[
              { id: "count", target: totalCount, label: "פרויקטים פעילים" },
              { id: "domains", target: 4, label: "תחומי פעילות" },
              { id: "units", target: 12, label: "יחידות מחוברות" }
            ].map((stat) => (
              <div
                key={stat.id}
                className="projects-stat"
                data-stat-item
                data-stat-target={stat.target}
              >
                <span className="projects-stat__value" data-stat-value>
                  00
                </span>
                <span className="projects-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="projects-showcase__stack" data-projects-stack>
          <div className="projects-showcase__stack-scroller" data-projects-scroller>
            <div className="projects-showcase__inner">
              <div className="projects-showcase__bento">
                {allProjects.map((project, index) => (
                  <ProjectShowcaseCard key={project.id} project={project} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="structure" className="projects-showcase__org" data-org-frame>
          <div className="projects-showcase__org-scroller" data-org-scroller>
            <TeamShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
