"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 243;
const FRAME_DURATION = 8.083333;
const FRAME_BASE_PATH = "/hero-frames/frame_";
const VIDEO_SRC = "/videos/hero.mp4";

const trustedItems = [
  { name: 'צה"ל', mark: "✦" },
  { name: 'זק"א', mark: "✚" },
  { name: 'מד"א', mark: "◆" },
  { name: "כבאות והצלה", mark: "⌁" }
];

// The canvas sequence is exported from the source video at 30fps to avoid HTML5 seeking jitter during scroll scrubbing.
function framePath(index: number) {
  return `${FRAME_BASE_PATH}${String(index).padStart(4, "0")}.jpg`;
}

export default function HeroScrollVideo() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const trustedRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const frameImagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    const animateCount = () => {
      setDisplayedProgress((current) => {
        if (current >= loadingProgress) return current;
        const next = current + Math.max(1, Math.ceil((loadingProgress - current) * 0.08));
        return Math.min(next, loadingProgress);
      });
      rafId = requestAnimationFrame(animateCount);
    };

    rafId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(rafId);
  }, [loadingProgress]);

  useEffect(() => {
    let isMounted = true;
    const loadStartedAt = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.body.style.overflow;
    history.scrollRestoration = "manual";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.82
    });
    lenis.stop();

    let lenisRafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(raf);
    };

    lenisRafId = requestAnimationFrame(raf);
    gsap.ticker.lagSmoothing(0);

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const video = videoRef.current;

    let resizeObserver: ResizeObserver | undefined;
    let scrollTrigger: ScrollTrigger | undefined;
    let timeline: gsap.core.Timeline | undefined;

    const renderFrame = (frameIndex: number) => {
      if (!canvas || !context) return;

      const image = frameImagesRef.current[frameIndex];
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
      const frameIndex = Math.min(FRAME_COUNT - 1, Math.round(clampedProgress * (FRAME_COUNT - 1)));

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        renderFrame(frameIndex);
      }

      if (video?.readyState && Number.isFinite(video.duration)) {
        video.currentTime = gsap.utils.clamp(0, video.duration, clampedProgress * video.duration);
      } else if (video) {
        video.currentTime = clampedProgress * FRAME_DURATION;
      }
    };

    const getScrollProgress = () => {
      const sectionHeight = sectionRef.current?.offsetHeight ?? window.innerHeight;
      const scrollableDistance = Math.max(1, sectionHeight - window.innerHeight);
      return gsap.utils.clamp(0, 1, window.scrollY / scrollableDistance);
    };

    const applyProgress = (progress: number) => {
      const clampedProgress = gsap.utils.clamp(0, 1, progress);
      timeline?.progress(clampedProgress);
      syncFrame(clampedProgress);
    };

    lenis.on("scroll", (event: { progress?: number; scroll?: number; limit?: number }) => {
      const lenisProgress =
        typeof event.progress === "number"
          ? event.progress
          : typeof event.scroll === "number" && typeof event.limit === "number" && event.limit > 0
            ? event.scroll / event.limit
            : 0;

      ScrollTrigger.update();
      applyProgress(Math.max(getScrollProgress(), lenisProgress));
    });

    const preloadFrames = async () => {
      let loadedUnits = 0;
      const totalUnits = FRAME_COUNT + 1;
      const updateProgress = () => {
        loadedUnits += 1;
        if (isMounted) {
          setLoadingProgress(Math.min(100, Math.round((loadedUnits / totalUnits) * 100)));
        }
      };

      frameImagesRef.current = Array.from({ length: FRAME_COUNT }, (_, index) => {
        const image = new Image();
        image.decoding = "async";
        image.loading = "eager";
        if (index === FRAME_COUNT - 1) image.fetchPriority = "high";
        image.src = framePath(index + 1);
        return image;
      });

      frameImagesRef.current[0].onload = () => renderFrame(0);
      const framePromises = frameImagesRef.current.map(
        (image, index) =>
          new Promise<void>((resolve) => {
            if (image.complete && image.naturalWidth > 0) {
              updateProgress();
              resolve();
              return;
            }

            image.onload = () => {
              updateProgress();
              if (index === 0) renderFrame(0);
              resolve();
            };
            image.onerror = () => {
              updateProgress();
              resolve();
            };
          })
      );

      const fontPromise = Promise.all([
        document.fonts.load('700 1rem "Assistant Bold"'),
        document.fonts.ready
      ]).then(() => updateProgress());
      await Promise.all([...framePromises, fontPromise]);
      if (!isMounted) return;

      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true, force: true });
      renderFrame(0);
      applyProgress(0);
      setLoadingProgress(100);

      const elapsed = performance.now() - loadStartedAt;
      const revealDelay = Math.max(450, 1450 - elapsed);
      window.setTimeout(() => {
        if (!isMounted) return;
        isReadyRef.current = true;
        setIsReady(true);
        document.body.style.overflow = previousOverflow;
        lenis.start();
        ScrollTrigger.refresh();
      }, 220);
    };

    const setupScroll = () => {
      if (!sectionRef.current || !pinRef.current || !copyRef.current || !navRef.current) return;

      gsap.set([copyRef.current, navRef.current, subtitleRef.current, trustedRef.current, scrollCueRef.current], {
        autoAlpha: 1,
        y: 0,
        yPercent: 0,
        scale: 1
      });

      timeline = gsap.timeline({ paused: true });
      timeline
        .to(copyRef.current, { yPercent: -15, scale: 0.82, autoAlpha: 0.18, duration: 1, ease: "none" }, 0)
        .to(subtitleRef.current, { y: -28, autoAlpha: 0, duration: 0.42, ease: "none" }, 0.08)
        .to(trustedRef.current, { y: -20, autoAlpha: 0, duration: 0.5, ease: "none" }, 0.1)
        .to(scrollCueRef.current, { y: 18, autoAlpha: 0, duration: 0.25, ease: "none" }, 0)
        .to(navRef.current, { y: -22, scale: 0.97, autoAlpha: 0.54, duration: 0.72, ease: "none" }, 0)
        .to([canvasRef.current, videoRef.current], { scale: 1.16, yPercent: -1.8, duration: 1, ease: "none" }, 0);

      scrollTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => {
          const sectionHeight = sectionRef.current?.offsetHeight ?? window.innerHeight;
          return `+=${Math.max(1, sectionHeight - window.innerHeight)}`;
        },
        scrub: reduceMotion ? false : 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (reduceMotion || !isReadyRef.current) return;
          applyProgress(Math.max(self.progress, getScrollProgress()));
        },
        onLeave: () => applyProgress(1),
        onEnterBack: () => applyProgress(1),
        onLeaveBack: () => applyProgress(0)
      });

      applyProgress(0);
    };

    setupScroll();
    void preloadFrames();

    const handleResize = () => {
      renderFrame(currentFrameRef.current);
      ScrollTrigger.refresh();
    };

    resizeObserver = new ResizeObserver(handleResize);
    if (pinRef.current) resizeObserver.observe(pinRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(lenisRafId);
      lenis.destroy();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      scrollTrigger?.kill();
      timeline?.kill();
    };
  }, []);

  const trustedRow = [...trustedItems, ...trustedItems];

  return (
    <section ref={sectionRef} className="hero-scroll relative h-[350vh] bg-[#f4f1e8]" dir="rtl">
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${framePath(1)})` }}
        />

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="hero-canvas absolute inset-0 z-[1] h-full w-full"
        />

        <video
          ref={videoRef}
          aria-hidden="true"
          className="hero-video pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-0"
          src={VIDEO_SRC}
          poster={framePath(1)}
          muted
          playsInline
          preload="auto"
        />

        <nav
          ref={navRef}
          dir="ltr"
          className="hero-nav absolute left-1/2 top-5 z-30 grid w-[calc(100%-48px)] max-w-6xl -translate-x-1/2 grid-cols-[1fr_auto_1fr] items-center px-1 py-1 font-assistant text-xs font-extralight tracking-normal text-[#102010]"
        >
          <div className="justify-self-start" dir="rtl">
            <div className="hidden items-center gap-2 sm:flex">
              <a
                href="#"
                className="rounded-full border border-black/10 bg-[#f8f6ed]/58 px-3 py-1.5 text-[10px] text-[#102010] backdrop-blur-sm transition-[background,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#f8f6ed]/85"
              >
                צפייה
              </a>
              <a
                href="#"
                className="rounded-full bg-[#102010] px-3.5 py-1.5 text-[10px] text-[#f8f6ed] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                התחלה
              </a>
            </div>
          </div>

          <a href="#" className="flex items-center justify-center gap-2 justify-self-center" dir="rtl">
            <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-[#102010]">
              <NextImage src="/logo-rabbanut.png" alt="" width={32} height={32} className="h-full w-full object-cover" />
            </span>
            <span className="type-assistant-bold hidden text-sm sm:block">הרבנות הצבאית</span>
          </a>

          <div className="flex items-center gap-5 justify-self-end md:gap-7" dir="rtl">
            <a className="nav-link-underline type-assistant-bold" href="#">
              בית
            </a>
            <a className="nav-link-underline type-assistant-bold hidden sm:inline" href="#">
              אודות
            </a>
            <a className="nav-link-underline type-assistant-bold hidden sm:inline" href="#">
              קשר
            </a>
          </div>
        </nav>

        <div className="pointer-events-none relative z-20 flex h-full items-start justify-center px-5 pt-[16vh] text-center sm:pt-[14vh] lg:pt-[12vh]">
          <div ref={copyRef} className="hero-copy w-full max-w-[1160px] origin-top">
            <h1 className="type-assistant-bold mx-auto max-w-[1040px] text-balance text-[1.65rem] leading-[1.05] tracking-normal text-[#102010] sm:text-[2.35rem] md:text-[2.85rem] lg:text-[3.2rem] xl:text-[3.5rem]">
              ברוכים הבאים למשפחת הרבנות הצבאית
            </h1>
            <p
              ref={subtitleRef}
              className="mx-auto mt-3 max-w-2xl text-balance font-assistant text-sm font-extralight leading-[1.3] tracking-normal text-[#102010]/82 sm:text-base lg:text-lg"
            >
              חווית אתר שלא נראתה בצה״ל
            </p>
            <div ref={trustedRef} className="mx-auto mt-4 max-w-5xl overflow-hidden sm:mt-5">
              <p className="font-assistant text-[10px] font-extralight tracking-[0.18em] text-[#102010]/62">
                נאמנים על ידי
              </p>
              <div className="trusted-marquee mt-5">
                <div className="trusted-track">
                  {trustedRow.map((item, index) => (
                    <div className="trusted-logo" key={`${item.name}-${index}`}>
                      <span className="trusted-mark">{item.mark}</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={scrollCueRef}
          className="scroll-cue pointer-events-none absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5 font-assistant text-[10px] font-extralight text-[#102010]/80 sm:bottom-8"
          aria-hidden="true"
        >
          <div className="relative h-11 w-7 rounded-full border border-[#102010]/45 bg-[#f8f6ed]/22 backdrop-blur-sm">
            <span className="scroll-cue-dot absolute left-1/2 top-3 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#102010]" />
          </div>
          <span>גללו</span>
        </div>

        <div
          className={`loader-screen fixed inset-0 z-50 bg-[#f8f6ed] transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${
            isReady ? "-translate-y-full" : "translate-y-0"
          }`}
          aria-hidden={isReady}
        >
          <div className="absolute bottom-8 left-8 font-assistant text-[#102010] sm:bottom-10 sm:left-10">
            <div className="text-[2.25rem] font-extralight leading-none tracking-normal sm:text-[3.25rem]">
              {displayedProgress}
            </div>
            <div className="mt-3 h-px w-40 overflow-hidden bg-[#102010]/12">
              <span
                className="block h-full bg-[#102010] transition-[width] duration-300"
                style={{ width: `${displayedProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
