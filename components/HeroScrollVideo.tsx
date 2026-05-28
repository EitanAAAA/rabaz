"use client";

import { useEffect, useRef, useState } from "react";
import { FallingHeroImages, KnowledgeHeroOverlay } from "@/components/KnowledgeLandingHero";
import { HeroParallaxFrame } from "@/components/HeroParallaxFrame";
import { HeroVideoDialog } from "@/components/magicui/hero-video-dialog";
import { FramePreloader } from "@/lib/FramePreloader";
import {
  dispatchHeroFrameChange,
  frameIndexFromProgress,
  framePath,
  FRAME_COUNT
} from "@/lib/heroFrames";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_PX_PER_FRAME = 16;
const OLD_FRAME_COUNT = 302;
const scaleFrame = (frame: number) => (frame / OLD_FRAME_COUNT) * FRAME_COUNT;

export default function HeroScrollVideo() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const frameShellRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const botStageRef = useRef<HTMLDivElement | null>(null);
  const frameImagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const loadingProgressRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);
  const isImageStackHoveredRef = useRef(false);
  const imageExitProgressRef = useRef(0);

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
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.85
    });
    lenis.stop();
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    let resizeObserver: ResizeObserver | undefined;
    let scrollTrigger: ScrollTrigger | undefined;
    let timeline: gsap.core.Timeline | undefined;
    let imageHoverCleanup: (() => void) | undefined;

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
        offsetY = canvas.height - drawHeight;
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

    const syncImageExit = (exitProgress: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const cards = section.querySelectorAll<HTMLElement>(".hero-falling-card");
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const hoverProgress = exitProgress < 0.06 && isImageStackHoveredRef.current ? 1 : 0;

      cards.forEach((card) => {
        const cardHeight = card.offsetHeight || 1;
        const fallIndex = Number((card.dataset.index ?? card.style.getPropertyValue("--fall-index")) || 0);
        const side = fallIndex % 2 === 0 ? 1 : -1;
        const depth = 0.68 + (fallIndex % 6) * 0.055;
        const hoverX = side * viewportWidth * (0.08 + (fallIndex % 5) * 0.018) * hoverProgress;
        const hoverY = -viewportHeight * (0.012 + (fallIndex % 4) * 0.006) * hoverProgress;
        const driftX = hoverX + side * viewportWidth * depth * exitProgress;
        const driftY = viewportHeight - cardHeight + hoverY - viewportHeight * (0.035 + (fallIndex % 5) * 0.012) * exitProgress;
        const rotate = side * ((5 + (fallIndex % 4) * 1.5) * hoverProgress + (8 + (fallIndex % 4) * 2.6) * exitProgress);
        const scale = 1 + hoverProgress * 0.02 - exitProgress * 0.12;
        const opacity = 0.98 * (1 - exitProgress);

        card.style.setProperty("opacity", String(opacity), "important");
        card.style.setProperty("z-index", String(18 + fallIndex));
        card.style.setProperty(
          "transform",
          `translate(calc(-50% + ${driftX}px), ${driftY}px) rotate(${rotate}deg) scale(${scale})`,
          "important"
        );
      });
    };

    const syncBotVideo = (revealProgress: number, stageVisibility: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const zoomEased = gsap.parseEase("power3.out")(revealProgress);
      const veilEased = gsap.parseEase("power2.in")(revealProgress);
      const veilOpacity = (1 - veilEased) * 0.9;
      const playReady = revealProgress > 0.95 && stageVisibility >= 0.999;
      section.style.setProperty("--hero-bot-video-progress", zoomEased.toFixed(4));
      section.style.setProperty("--hero-bot-video-veil-opacity", veilOpacity.toFixed(4));
      section.style.setProperty("--hero-bot-content-opacity", veilEased.toFixed(4));
      section.style.setProperty("--hero-bot-video-visible", stageVisibility.toFixed(4));
      section.style.setProperty("--hero-bot-video-play-ready", playReady ? "1" : "0");
    };

    const applyProgress = (progress: number) => {
      const clampedProgress = gsap.utils.clamp(0, 1, progress);
      const imageExitFrame = scaleFrame(100);
      const stageFadeInStart = scaleFrame(172);
      const stageFadeInEnd = scaleFrame(188);
      const revealStartFrame = scaleFrame(182);
      const revealEndFrame = scaleFrame(272);
      const imageExitProgress = gsap.utils.clamp(0, 1, gsap.parseEase("power2.inOut")(clampedProgress / (imageExitFrame / FRAME_COUNT)));
      const stageVisibility = gsap.utils.clamp(0, 1, (clampedProgress - stageFadeInStart / FRAME_COUNT) / ((stageFadeInEnd - stageFadeInStart) / FRAME_COUNT));
      const revealProgress = gsap.utils.clamp(0, 1, (clampedProgress - revealStartFrame / FRAME_COUNT) / ((revealEndFrame - revealStartFrame) / FRAME_COUNT));
      imageExitProgressRef.current = imageExitProgress;
      sectionRef.current?.style.setProperty("--hero-image-exit", imageExitProgress.toFixed(4));
      syncImageExit(imageExitProgress);
      syncBotVideo(revealProgress, stageVisibility);
      timeline?.progress(clampedProgress);
      syncFrame(clampedProgress);
    };

    const bindImageStackHover = () => {
      const section = sectionRef.current;
      if (!section) return () => undefined;

      const cards = Array.from(section.querySelectorAll<HTMLElement>(".hero-falling-card"));
      const handleEnter = () => {
        isImageStackHoveredRef.current = true;
        syncImageExit(imageExitProgressRef.current);
      };
      const handleLeave = () => {
        isImageStackHoveredRef.current = false;
        syncImageExit(imageExitProgressRef.current);
      };

      cards.forEach((card) => {
        card.addEventListener("pointerenter", handleEnter);
        card.addEventListener("pointerleave", handleLeave);
      });

      return () => {
        cards.forEach((card) => {
          card.removeEventListener("pointerenter", handleEnter);
          card.removeEventListener("pointerleave", handleLeave);
        });
      };
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
      if (!sectionRef.current || !pinRef.current || !frameShellRef.current || !copyRef.current || !navRef.current || !botStageRef.current) return;

      scrollTrigger?.kill();
      timeline?.kill();

      const fadeTargets = [copyRef.current, navRef.current].filter(Boolean);

      gsap.set(fadeTargets, {
        autoAlpha: 1,
        y: 0,
        yPercent: 0,
        scale: 1,
        transformOrigin: "50% 18%"
      });

      gsap.set(frameShellRef.current, {
        scale: 1,
        yPercent: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        boxShadow: "0 0 0 rgba(20,33,17,0)",
        transformOrigin: "50% 50%"
      });

      gsap.set(botStageRef.current, {
        scale: 1,
        yPercent: 0,
        transformOrigin: "50% 50%"
      });

      const heroFadeEnd = Math.max(0.05, 1 - 80 / FRAME_COUNT);
      const heroTransitionStart = Math.max(0.965, 1 - 10 / FRAME_COUNT);
      const heroTransitionDuration = 1 - heroTransitionStart;

      timeline = gsap.timeline({ paused: true });
      timeline
        .to(copyRef.current, { yPercent: -9, scale: 0.68, autoAlpha: 0, duration: heroFadeEnd, ease: "none" }, 0)
        .to(navRef.current, { y: -14, scale: 0.9, autoAlpha: 0, duration: heroFadeEnd * 0.64, ease: "none" }, 0)
        .to(canvasRef.current, { scale: 1.08, yPercent: -1.2, duration: 1, ease: "none" }, 0)
        .to(
          frameShellRef.current,
          {
            scale: 0.88,
            yPercent: -7,
            borderBottomLeftRadius: 44,
            borderBottomRightRadius: 44,
            boxShadow: "0 34px 90px rgba(20,33,17,0.16)",
            duration: heroTransitionDuration,
            ease: "power2.inOut"
          },
          heroTransitionStart
        )
        .to(
          botStageRef.current,
          {
            scale: 0.9,
            yPercent: -7,
            duration: heroTransitionDuration,
            ease: "power2.inOut"
          },
          heroTransitionStart
        );

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
      imageHoverCleanup?.();
      imageHoverCleanup = bindImageStackHover();
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
      gsap.ticker.remove(lenisTicker);
      lenis.destroy();
      lenisRef.current = null;
      resizeObserver?.disconnect();
      imageHoverCleanup?.();
      window.removeEventListener("resize", handleResize);
      scrollTrigger?.kill();
      timeline?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-scroll relative bg-[var(--color-canvas-ice)] text-[var(--color-adaline-ink)]"
      style={{ height: `calc(100svh + ${FRAME_COUNT * SCROLL_PX_PER_FRAME}px)` }}
      dir="rtl"
    >
      <div ref={pinRef} className="hero-pin sticky top-0 h-screen w-full overflow-hidden">
        <div ref={frameShellRef} className="hero-frame-shell" aria-hidden="true">
          <div className="hero-mist-overlay pointer-events-none absolute inset-0 z-[2]" />
          <HeroParallaxFrame>
            <canvas ref={canvasRef} className="hero-canvas pointer-events-none absolute inset-0 z-0 h-full w-full" />
          </HeroParallaxFrame>
        </div>

        <FallingHeroImages isReady={isReady} />

        <div ref={botStageRef} className="hero-bot-video-stage">
          <div className="hero-bot-video-veil" aria-hidden="true" />
          <div className="hero-bot-video-content">
            <div className="hero-bot-label">
              <p className="hero-bot-label__title">הפרוייקט של היום:</p>
              <img
                className="hero-bot-label__logo"
                src="/images/ravbot-logo.png"
                alt="RavBot"
                width={1024}
                height={1024}
              />
            </div>
            <div className="hero-bot-video-dialog">
              <HeroVideoDialog
                animationStyle="top-in-bottom-out"
                videoSrc="/videos/rav-bot.mp4"
                thumbnailSrc="/videos/rav-bot-poster.jpg"
                thumbnailAlt="Rav bot video"
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-none relative z-20 h-full w-full">
          <div ref={copyRef} className="hero-copy hero-knowledge-copy h-full w-full origin-top">
            <KnowledgeHeroOverlay navRef={navRef} isReady={isReady} showImages={false} />
          </div>
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
