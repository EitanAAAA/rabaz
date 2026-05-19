"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import OrgChart3DSplitPreview from "@/components/OrgChart3DSplitPreview";
import PictureArcStacks from "@/components/PictureArcStacks";
import { FramePreloader } from "@/lib/FramePreloader";
import {
  dispatchHeroFrameChange,
  frameIndexFromProgress,
  framePath,
  FRAME_COUNT,
  FRAME_DURATION
} from "@/lib/heroFrames";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_VH_PER_SECOND = 90;

export default function HeroScrollVideo() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const orgChartRef = useRef<HTMLDivElement | null>(null);
  const frameImagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const loadingProgressRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    loadingProgressRef.current = loadingProgress;
  }, [loadingProgress]);

  useEffect(() => {
    let rafId = 0;
    const animateCount = () => {
      setDisplayedProgress((current) => {
        const target = loadingProgressRef.current;
        if (current >= target) return current;
        const step = Math.max(1, Math.ceil((target - current) * 0.14));
        return Math.min(current + step, target);
      });
      rafId = requestAnimationFrame(animateCount);
    };

    rafId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abort = new AbortController();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.body.style.overflow;
    history.scrollRestoration = "manual";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.85
    });
    lenis.stop();
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    let lenisRafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(raf);
    };

    lenisRafId = requestAnimationFrame(raf);
    gsap.ticker.lagSmoothing(0);

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    let resizeObserver: ResizeObserver | undefined;
    let scrollTrigger: ScrollTrigger | undefined;
    let timeline: gsap.core.Timeline | undefined;

    const ensureImage = (frameIndex: number) => {
      const existing = frameImagesRef.current[frameIndex];
      if (existing?.naturalWidth) return existing;

      const frameNumber = frameIndex + 1;
      const image = new Image();
      image.decoding = "async";
      image.src = framePath(frameNumber);
      frameImagesRef.current[frameIndex] = image;
      return image;
    };

    const renderFrame = (frameIndex: number) => {
      if (!canvas || !context) return;

      const image = ensureImage(frameIndex);
      if (!image) return;

      if (!image.complete || image.naturalWidth === 0) {
        image.onload = () => {
          if (currentFrameRef.current === frameIndex) renderFrame(frameIndex);
        };
        return;
      }

      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetWidth = Math.max(1, Math.floor(rect.width * ratio));
      const targetHeight = Math.max(1, Math.floor(rect.height * ratio));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.clearRect(0, 0, canvas.width, canvas.height);

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    const syncFrame = (progress: number) => {
      const clampedProgress = gsap.utils.clamp(0, 1, progress);
      const frameIndex = frameIndexFromProgress(clampedProgress);
      const frameNumber = frameIndex + 1;

      dispatchHeroFrameChange({
        frameIndex,
        frameNumber,
        progress: clampedProgress,
        frameSrc: framePath(frameNumber)
      });

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        renderFrame(frameIndex);
      }
    };

    const applyProgress = (progress: number) => {
      const clampedProgress = gsap.utils.clamp(0, 1, progress);
      timeline?.progress(clampedProgress);
      syncFrame(clampedProgress);
    };

    const pushProgress = (percent: number) => {
      const next = Math.min(100, Math.max(loadingProgressRef.current, percent));
      loadingProgressRef.current = next;
      if (isMounted) setLoadingProgress(next);
    };

    const simulatedProgressId = window.setInterval(() => {
      if (!isMounted || abort.signal.aborted) return;
      const simulated = Math.min(96, loadingProgressRef.current + 1);
      pushProgress(simulated);
    }, 45);

    const finishLoading = () => {
      pushProgress(100);
      window.setTimeout(() => {
        if (!isMounted || abort.signal.aborted) return;
        isReadyRef.current = true;
        setIsReady(true);
        document.body.style.overflow = previousOverflow;
        ScrollTrigger.refresh(true);
        applyProgress(scrollTrigger?.progress ?? 0);
      }, 600);
    };

    const preloadFrames = async () => {
      pushProgress(1);

      const preloader = new FramePreloader(FRAME_COUNT, framePath, pushProgress);
      frameImagesRef.current = await preloader.load(abort.signal);

      if (!isMounted || abort.signal.aborted) return;

      renderFrame(0);

      await Promise.race([
        document.fonts.ready,
        new Promise<void>((resolve) => window.setTimeout(resolve, 1500))
      ]);

      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true, force: true });
    };

    const setupScroll = () => {
      if (!sectionRef.current || !pinRef.current || !copyRef.current || !navRef.current) return;

      scrollTrigger?.kill();
      timeline?.kill();

      const fadeTargets = [copyRef.current, navRef.current, orgChartRef.current].filter(Boolean);

      gsap.set(fadeTargets, {
        autoAlpha: 1,
        y: 0,
        yPercent: 0,
        scale: 1,
        transformOrigin: "50% 18%"
      });

      timeline = gsap.timeline({ paused: true });
      timeline
        .to(copyRef.current, { yPercent: -9, scale: 0.68, autoAlpha: 0, duration: 0.78, ease: "none" }, 0)
        .to(navRef.current, { y: -14, scale: 0.9, autoAlpha: 0, duration: 0.5, ease: "none" }, 0)
        .to(canvasRef.current, { scale: 1.08, yPercent: -1.2, duration: 1, ease: "none" }, 0);

      if (orgChartRef.current) {
        timeline.to(orgChartRef.current, { y: -12, scale: 0.94, autoAlpha: 0, duration: 0.55, ease: "none" }, 0.02);
      }

      scrollTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => {
          const sectionHeight = sectionRef.current?.offsetHeight ?? window.innerHeight;
          return `+=${Math.max(1, sectionHeight - window.innerHeight)}`;
        },
        scrub: reduceMotion ? false : true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (reduceMotion || !isReadyRef.current) return;
          applyProgress(self.progress);
        },
        onLeave: () => applyProgress(1),
        onEnterBack: () => applyProgress(1),
        onLeaveBack: () => applyProgress(0)
      });

      applyProgress(0);
    };

    const initExperience = async () => {
      setupScroll();
      await preloadFrames().catch(() => undefined);
      if (!isMounted || abort.signal.aborted) return;
      setupScroll();
      ScrollTrigger.refresh(true);
      lenis.start();
      applyProgress(0);
      finishLoading();
    };

    void initExperience();

    const handleResize = () => {
      renderFrame(currentFrameRef.current);
      ScrollTrigger.refresh(true);
      if (isReadyRef.current) applyProgress(scrollTrigger?.progress ?? 0);
    };

    resizeObserver = new ResizeObserver(handleResize);
    if (pinRef.current) resizeObserver.observe(pinRef.current);
    if (sectionRef.current) resizeObserver.observe(sectionRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      abort.abort();
      window.clearInterval(simulatedProgressId);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(lenisRafId);
      lenis.destroy();
      lenisRef.current = null;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      scrollTrigger?.kill();
      timeline?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-scroll relative bg-[var(--color-canvas-ice)] text-[var(--color-adaline-ink)]"
      style={{ height: `calc(100vh + ${FRAME_DURATION * SCROLL_VH_PER_SECOND}vh)` }}
      dir="rtl"
    >
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="hero-mist-overlay pointer-events-none absolute inset-0 z-[2]"
        />

        <canvas ref={canvasRef} aria-hidden="true" className="hero-canvas pointer-events-none absolute inset-0 z-0 h-full w-full" />

        <header ref={navRef} className="hero-header">
          <a href="#" className="hero-header-brand">
            <span className="hero-header-logo">
              <NextImage src="/logo-rabbanut.png" alt="הרבנות הצבאית" width={72} height={72} priority />
            </span>
          </a>

          <nav className="hero-header-links" aria-label="ניווט ראשי">
            <a className="hero-header-link" href="#">בית</a>
            <a className="hero-header-link" href="#">אודות</a>
            <a className="hero-header-link" href="#">קשר</a>
          </nav>
        </header>

        <div className="pointer-events-none relative z-20 flex h-full items-start justify-center px-5 pt-[1.15rem] text-center sm:pt-[1rem] lg:pt-[0.95rem]">
          <div ref={copyRef} className="hero-copy w-full max-w-[1320px] origin-top">
            <PictureArcStacks />
            <div ref={orgChartRef} className="mx-auto mt-1 max-w-5xl">
              <OrgChart3DSplitPreview />
            </div>
          </div>
        </div>

        <div className="hero-scroll-cue" aria-hidden="true">
          <span className="hero-scroll-mouse">
            <span className="hero-scroll-dot" />
          </span>
        </div>
      </div>

      <div
        className={`loader-screen bg-[var(--color-canvas-ice)] transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${isReady ? "-translate-y-full" : "translate-y-0"}`}
        aria-hidden={isReady}
      >
        <div className="absolute bottom-8 left-8 text-[var(--color-adaline-ink)] sm:bottom-10 sm:left-10">
          <div className="text-[3rem] font-light leading-none tracking-[-0.05em] sm:text-[4.5rem]">
            {Math.max(displayedProgress, loadingProgress)}
          </div>
          <div className="mt-3 h-px w-40 overflow-hidden bg-[var(--color-stone-moss)]">
            <span
              className="block h-full bg-[var(--color-valley-green)] transition-[width] duration-300"
              style={{ width: `${Math.max(displayedProgress, loadingProgress)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
