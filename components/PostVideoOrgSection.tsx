"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TeamShowcase from "@/components/TeamShowcase";

gsap.registerPlugin(ScrollTrigger);

class OrgStackAnimator {
  private triggers: ScrollTrigger[] = [];

  // Pins the section frame at the top and scrolls only the inner content (stack scroll).
  mount(section: HTMLElement, reduceMotion: boolean): void {
    const stage = section.querySelector<HTMLElement>("[data-org-stage]");
    const frame = section.querySelector<HTMLElement>("[data-org-frame]");
    const scroller = section.querySelector<HTMLElement>("[data-org-scroller]");
    if (!stage || !frame || !scroller) return;
    if (reduceMotion) return;

    const innerDistance = () => Math.max(0, scroller.scrollHeight - frame.clientHeight);

    this.triggers.push(
      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${innerDistance() + window.innerHeight * 0.6}`,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1.1,
        invalidateOnRefresh: true,
        animation: gsap.fromTo(
          scroller,
          { y: 0 },
          { y: () => -innerDistance(), ease: "none", immediateRender: false }
        )
      })
    );
  }

  destroy(): void {
    this.triggers.forEach((trigger) => trigger.kill());
    this.triggers = [];
  }
}

export default function PostVideoOrgSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animator = new OrgStackAnimator();
    animator.mount(section, reduceMotion);

    const refresh = () => ScrollTrigger.refresh(true);
    const refreshIds = [0, 400, 1200].map((delay) => window.setTimeout(refresh, delay));
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(section);
    window.addEventListener("load", refresh);

    return () => {
      refreshIds.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("load", refresh);
      resizeObserver.disconnect();
      animator.destroy();
    };
  }, []);

  return (
    <section ref={sectionRef} id="structure" className="org-stack" dir="rtl" aria-label="הכירו את הצוות">
      <div className="org-stack__stage" data-org-stage>
        <div className="org-stack__frame" data-org-frame>
          <div className="org-stack__scroller" data-org-scroller>
            <TeamShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
