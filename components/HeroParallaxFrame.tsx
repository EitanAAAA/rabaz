"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CSSProperties, PropsWithChildren } from "react";

type HeroParallaxFrameProps = PropsWithChildren<{
  moveX?: number;
  moveY?: number;
  tiltX?: number;
  tiltY?: number;
  baseScale?: number;
  offsetY?: number;
  glare?: boolean;
}>;

const SPRING_CONFIG = { stiffness: 90, damping: 22, mass: 0.65 } as const;

export function HeroParallaxFrame({
  children,
  moveX = 32,
  moveY = 20,
  tiltX = 3.5,
  tiltY = 3.5,
  baseScale = 1.1,
  glare = true
}: HeroParallaxFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const smoothX = useSpring(normX, SPRING_CONFIG);
  const smoothY = useSpring(normY, SPRING_CONFIG);

  const translateX = useTransform(smoothX, (value) => value * -moveX);
  const translateY = useTransform(smoothY, (value) => value * -moveY);
  const rotateY = useTransform(smoothX, (value) => value * tiltY);
  const rotateX = useTransform(smoothY, (value) => value * -tiltX);

  const glareX = useTransform(smoothX, (value) => `${50 + value * 35}%`);
  const glareY = useTransform(smoothY, (value) => `${50 + value * 35}%`);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCoarsePointer || prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInside) {
        normX.set(0);
        normY.set(0);
        return;
      }

      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      normX.set(nx);
      normY.set(ny);
    };

    const reset = () => {
      normX.set(0);
      normY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [normX, normY]);

  return (
    <div ref={containerRef} className="hero-parallax-frame" aria-hidden="true">
      <motion.div
        className="hero-parallax-inner"
        style={{
          x: translateX,
          y: translateY,
          rotateX,
          rotateY,
          scale: baseScale
        }}
      >
        {children}
      </motion.div>
      {glare ? (
        <motion.div
          className="hero-parallax-glare"
          style={
            {
              "--hero-glare-x": glareX,
              "--hero-glare-y": glareY
            } as never
          }
          aria-hidden="true"
        />
      ) : null}
      <div className="hero-parallax-vignette" aria-hidden="true" />
    </div>
  );
}

export default HeroParallaxFrame;
