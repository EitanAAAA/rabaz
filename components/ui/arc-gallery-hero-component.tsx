"use client";

import React, { useEffect, useRef, useState } from "react";

type ArcGalleryHeroProps = {
  images: string[];
  side?: "left" | "right";
  startAngle?: number;
  endAngle?: number;
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  cardWidthLg?: number;
  cardWidthMd?: number;
  cardWidthSm?: number;
  cardHeightLg?: number;
  cardHeightMd?: number;
  cardHeightSm?: number;
  className?: string;
};

export const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  side = "left",
  startAngle = -62,
  endAngle = 62,
  radiusLg = 210,
  radiusMd = 170,
  radiusSm = 135,
  cardWidthLg = 142,
  cardWidthMd = 118,
  cardWidthSm = 96,
  cardHeightLg = 90,
  cardHeightMd = 76,
  cardHeightSm = 64,
  className = ""
}) => {
  const visibleCount = Math.min(6, images.length);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [detachedCards, setDetachedCards] = useState<Set<number>>(() => new Set());
  const [detachedSlots, setDetachedSlots] = useState<Record<number, number>>({});
  const motionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const physicsRef = useRef<
    Map<
      number,
      {
        x: number;
        y: number;
        vx: number;
        vy: number;
        dragging: boolean;
        pointerId?: number;
        lastX: number;
        lastY: number;
        lastTime: number;
        raf?: number;
        runId: number;
      }
    >
  >(new Map());

  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardWidth: cardWidthLg,
    cardHeight: cardHeightLg
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardWidth: cardWidthSm, cardHeight: cardHeightSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardWidth: cardWidthMd, cardHeight: cardHeightMd });
      } else {
        setDimensions({ radius: radiusLg, cardWidth: cardWidthLg, cardHeight: cardHeightLg });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardWidthLg, cardWidthMd, cardWidthSm, cardHeightLg, cardHeightMd, cardHeightSm]);

  const visibleImageIndexes = Array.from({ length: visibleCount }, (_, index) => index);
  const carouselImageIndexes = visibleImageIndexes.filter((index) => !detachedCards.has(index));
  const carouselCount = carouselImageIndexes.length;
  const count = Math.max(carouselCount, 2);
  const step = (endAngle - startAngle) / (count - 1);
  const direction = side === "left" ? -1 : 1;

  useEffect(() => {
    if (carouselCount <= 1) return;

    const intervalId = window.setInterval(() => {
      const hasDraggingCard = Array.from(physicsRef.current.values()).some((item) => item.dragging);
      if (!hasDraggingCard) {
        setCarouselIndex((current) => (current + 1) % carouselCount);
      }
    }, 1350);

    return () => window.clearInterval(intervalId);
  }, [carouselCount]);

  useEffect(() => {
    const physics = physicsRef.current;
    return () => {
      physics.forEach((item) => {
        if (item.raf) cancelAnimationFrame(item.raf);
      });
    };
  }, []);

  const getPhysics = (index: number) => {
    const existing = physicsRef.current.get(index);
    if (existing) return existing;

    const next: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      dragging: boolean;
      pointerId?: number;
      lastX: number;
      lastY: number;
      lastTime: number;
      raf?: number;
      runId: number;
    } = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      dragging: false,
      pointerId: undefined,
      lastX: 0,
      lastY: 0,
      lastTime: 0,
      raf: undefined,
      runId: 0
    };
    physicsRef.current.set(index, next);
    return next;
  };

  const paintCard = (index: number) => {
    const element = motionRefs.current[index];
    const physics = getPhysics(index);
    if (!element) return;
    element.style.transform = `translate3d(${physics.x}px, ${physics.y}px, 0)`;
  };

  const stepMomentum = (index: number, runId: number) => {
    const physics = getPhysics(index);
    if (physics.dragging || physics.runId !== runId) return;

    physics.x += physics.vx;
    physics.y += physics.vy;

    const element = motionRefs.current[index];
    const rect = element?.getBoundingClientRect();
    if (rect) {
      const padding = 10;
      if (rect.left < padding && physics.vx < 0) {
        physics.x += padding - rect.left;
        physics.vx *= -0.48;
      }
      if (rect.right > window.innerWidth - padding && physics.vx > 0) {
        physics.x -= rect.right - (window.innerWidth - padding);
        physics.vx *= -0.48;
      }
      if (rect.top < padding && physics.vy < 0) {
        physics.y += padding - rect.top;
        physics.vy *= -0.48;
      }
      if (rect.bottom > window.innerHeight - padding && physics.vy > 0) {
        physics.y -= rect.bottom - (window.innerHeight - padding);
        physics.vy *= -0.48;
      }
    }

    physics.vx *= 0.935;
    physics.vy *= 0.935;
    paintCard(index);

    if (Math.abs(physics.vx) > 0.08 || Math.abs(physics.vy) > 0.08) {
      physics.raf = requestAnimationFrame(() => stepMomentum(index, runId));
    } else {
      physics.vx = 0;
      physics.vy = 0;
      physics.raf = undefined;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, index: number, slot: number) => {
    const physics = getPhysics(index);
    if (physics.raf) cancelAnimationFrame(physics.raf);

    physics.raf = undefined;
    physics.runId += 1;
    physics.dragging = true;
    physics.pointerId = event.pointerId;
    physics.lastX = event.clientX;
    physics.lastY = event.clientY;
    physics.lastTime = performance.now();
    physics.vx = 0;
    physics.vy = 0;

    event.preventDefault();
    setDetachedCards((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
    setDetachedSlots((current) => (current[index] === undefined ? { ...current, [index]: slot } : current));
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
    event.currentTarget.parentElement?.classList.add("is-tossed");
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>, index: number) => {
    const physics = getPhysics(index);
    if (!physics.dragging || physics.pointerId !== event.pointerId) return;

    const now = performance.now();
    const dt = Math.max(16, now - physics.lastTime);
    const dx = event.clientX - physics.lastX;
    const dy = event.clientY - physics.lastY;

    physics.x += dx;
    physics.y += dy;
    physics.vx = (dx / dt) * 16;
    physics.vy = (dy / dt) * 16;
    physics.lastX = event.clientX;
    physics.lastY = event.clientY;
    physics.lastTime = now;

    paintCard(index);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>, index: number) => {
    const physics = getPhysics(index);
    if (physics.pointerId !== event.pointerId) return;

    physics.dragging = false;
    physics.pointerId = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove("is-dragging");
    physics.runId += 1;
    const runId = physics.runId;
    physics.raf = requestAnimationFrame(() => stepMomentum(index, runId));
  };

  const handleLostPointerCapture = (event: React.PointerEvent<HTMLDivElement>, index: number) => {
    const physics = getPhysics(index);
    if (!physics.dragging) return;

    physics.dragging = false;
    physics.pointerId = undefined;
    event.currentTarget.classList.remove("is-dragging");
    physics.runId += 1;
    const runId = physics.runId;
    physics.raf = requestAnimationFrame(() => stepMomentum(index, runId));
  };

  return (
    <section className={`arc-gallery-side arc-gallery-side--${side} ${className}`}>
      <div
        className="arc-gallery-pivot"
        style={{
          width: dimensions.radius * 1.12,
          height: dimensions.radius * 2.15
        }}
      >
        {visibleImageIndexes.map((imageIndex) => {
          const src = images[imageIndex % images.length];
          const isDetached = detachedCards.has(imageIndex);
          const carouselPosition = carouselImageIndexes.indexOf(imageIndex);
          const slot =
            isDetached
              ? detachedSlots[imageIndex] ?? 0
              : carouselCount > 0
                ? (carouselPosition + carouselIndex) % carouselCount
                : 0;
          const angle = startAngle + step * slot;
          const angleRad = (angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * dimensions.radius * direction;
          const y = Math.sin(angleRad) * dimensions.radius;

          return (
            <div
              className="arc-gallery-card-wrap"
              key={`${src}-${imageIndex}`}
              style={{
                width: dimensions.cardWidth,
                height: dimensions.cardHeight,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                animationDelay: `${imageIndex * 75}ms`,
                zIndex: count - Math.abs(slot - count / 2),
                "--angle": `${direction * (angle / 5)}deg`,
                "--arc-enter-x": `${direction * 120}px`,
                "--arc-enter-rotate": `${direction * 54}deg`
              } as React.CSSProperties}
            >
              <div
                ref={(element) => {
                  motionRefs.current[imageIndex] = element;
                }}
                className="arc-gallery-card-motion"
                onPointerDown={(event) => handlePointerDown(event, imageIndex, slot)}
                onPointerMove={(event) => handlePointerMove(event, imageIndex)}
                onPointerUp={(event) => handlePointerUp(event, imageIndex)}
                onPointerCancel={(event) => handlePointerUp(event, imageIndex)}
                onLostPointerCapture={(event) => handleLostPointerCapture(event, imageIndex)}
              >
                <div className="arc-gallery-card">
                <img
                  src={src}
                  alt={`Memory ${imageIndex + 1}`}
                  draggable={false}
                  onError={(event) => {
                    event.currentTarget.src = "https://placehold.co/400x260/e2e8f0/334155?text=Memory";
                  }}
                />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
