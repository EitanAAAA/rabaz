"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { TeamRoster, TEAM_HEADING, type TeamMember } from "@/lib/team/TeamRoster";

class TeamHoverController {
  // Encapsulates the anime.js hover choreography for a single org node.
  bind(node: HTMLElement): () => void {
    const avatar = node.querySelector<HTMLElement>("[data-avatar]");
    const lines = node.querySelectorAll<HTMLElement>("[data-line]");

    const enter = () => {
      animate(node, { translateY: -8, scale: 1.035, duration: 620, ease: "outElastic(1, .6)" });
      if (avatar) {
        animate(avatar, { scale: 1.16, rotate: -6, duration: 720, ease: "outElastic(1, .5)" });
      }
      if (lines.length) {
        animate(lines, {
          translateY: [10, 0],
          opacity: [0.5, 1],
          delay: stagger(55),
          duration: 520,
          ease: "outExpo"
        });
      }
    };

    const leave = () => {
      animate(node, { translateY: 0, scale: 1, duration: 480, ease: "outQuad" });
      if (avatar) {
        animate(avatar, { scale: 1, rotate: 0, duration: 480, ease: "outQuad" });
      }
    };

    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);

    return () => {
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
    };
  }
}

const hoverController = new TeamHoverController();

function TeamNode({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    return hoverController.bind(node);
  }, []);

  const initial = member.name.trim().charAt(0);

  return (
    <article ref={ref} className={`team-node${featured ? " team-node--featured" : ""}`}>
      <div className="team-node__avatar" data-avatar aria-hidden="true">
        {initial}
      </div>
      <div className="team-node__meta">
        {member.rank ? (
          <span className="team-node__rank" data-line>
            {member.rank}
          </span>
        ) : null}
        <h3 className="team-node__name" data-line>
          {member.name}
        </h3>
        <p className="team-node__role" data-line>
          {member.role}
        </p>
      </div>
    </article>
  );
}

export default function TeamShowcase() {
  const topBranch = TeamRoster.featured();
  const core = TeamRoster.byTier("core");
  const devs = TeamRoster.byTier("dev");

  return (
    <div className="team-org" dir="rtl">
      <aside className="team-org__aside">
        <p className="team-org__kicker">{TEAM_HEADING.kicker}</p>
        <h2 className="team-org__title">{TEAM_HEADING.title}</h2>
        <p className="team-org__subtitle">{TEAM_HEADING.subtitle}</p>
      </aside>

      <div className="team-tree">
        <div className="team-tree__level team-tree__level--command">
          {topBranch.map((member) => (
            <div key={member.id} className="team-tree__cell">
              <TeamNode member={member} featured />
            </div>
          ))}
        </div>

        <div className="team-tree__level team-tree__level--child" data-count={core.length}>
          {core.map((member) => (
            <div key={member.id} className="team-tree__cell">
              <TeamNode member={member} />
            </div>
          ))}
        </div>

        <div className="team-tree__level team-tree__level--child" data-count={devs.length}>
          {devs.map((member) => (
            <div key={member.id} className="team-tree__cell">
              <TeamNode member={member} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
