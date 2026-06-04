"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ProjectItem } from "@/lib/projects/ProjectItem";

type ProjectShowcaseCardProps = {
  project: ProjectItem;
  index: number;
};

class CardHoverController {
  private frameId = 0;
  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;

  bind(
    root: HTMLElement,
    media: HTMLElement,
    shine: HTMLElement,
    onLeave: () => void
  ): () => void {
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      this.targetX = px;
      this.targetY = py;
      shine.style.setProperty("--shine-x", `${(px + 0.5) * 100}%`);
      shine.style.setProperty("--shine-y", `${(py + 0.5) * 100}%`);
      root.style.setProperty("--pointer-x", `${(px + 0.5) * 100}%`);
      root.style.setProperty("--pointer-y", `${(py + 0.5) * 100}%`);
    };

    const tick = () => {
      this.currentX += (this.targetX - this.currentX) * 0.12;
      this.currentY += (this.targetY - this.currentY) * 0.12;
      const tiltX = this.currentY * -10;
      const tiltY = this.currentX * 12;
      media.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
      this.frameId = requestAnimationFrame(tick);
    };

    const onEnter = () => {
      root.classList.add("is-hovered");
      cancelAnimationFrame(this.frameId);
      this.frameId = requestAnimationFrame(tick);
    };

    const onPointerLeave = () => {
      root.classList.remove("is-hovered");
      cancelAnimationFrame(this.frameId);
      this.targetX = 0;
      this.targetY = 0;
      media.style.transform = "";
      onLeave();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(this.frameId);
    };
  }
}

const hoverController = new CardHoverController();

export function ProjectShowcaseCard({ project, index }: ProjectShowcaseCardProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const shineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    const shine = shineRef.current;
    if (!root || !media || !shine) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    return hoverController.bind(root, media, shine, () => undefined);
  }, []);

  const isRemoteImage = project.image.startsWith("http");
  const isLarge = project.tileSize === "xl";

  return (
    <article
      ref={rootRef}
      className={`project-card project-card--${project.tileSize}`}
      data-project-index={index}
      data-project-id={project.id}
      data-project-size={project.tileSize}
    >
      <div className="project-card__media" ref={mediaRef}>
        {isRemoteImage ? (
          <img src={project.image} alt="" className="project-card__image" loading="lazy" />
        ) : (
          <Image
            src={project.image}
            alt=""
            fill
            sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            className="project-card__image"
          />
        )}
        <div className="project-card__shine" ref={shineRef} aria-hidden="true" />
        <div className="project-card__scrim" aria-hidden="true" />

        {project.featured ? (
          <span className="project-card__badge">פרויקט נבחר</span>
        ) : null}

        {project.logo ? (
          <div className="project-card__logo">
            <Image src={project.logo} alt="" width={56} height={56} unoptimized />
          </div>
        ) : null}

        <div className="project-card__overlay">
          <div className="project-card__meta">
            <span className="project-card__category">{project.categoryLabel}</span>
            <span className="project-card__year">{project.year}</span>
          </div>
          <h3 className="project-card__title">{project.name}</h3>
          <p className="project-card__tagline">{project.tagline}</p>
          <div className="project-card__tags" aria-label="תגיות פרויקט">
            {project.tags.map((tag) => (
              <span key={`${project.id}-${tag}`} className="project-card__tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="project-card__cta">
            <span>לצפייה בפרויקט</span>
            <span className="project-card__arrow" aria-hidden="true">
              ←
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
