export const FRAME_COUNT = 360;
export const FRAME_DURATION = 12;
export const FRAME_BASE_PATH = "/hero-frames/frame_";
export const LAST_FRAME_INDEX = FRAME_COUNT;
export const LAST_FRAME_PATH = `${FRAME_BASE_PATH}${String(LAST_FRAME_INDEX).padStart(4, "0")}.jpg`;

export function framePath(index: number) {
  return `${FRAME_BASE_PATH}${String(index).padStart(4, "0")}.jpg`;
}

export function frameIndexFromProgress(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped >= 0.999) return FRAME_COUNT - 1;
  return Math.min(FRAME_COUNT - 1, Math.floor(clamped * (FRAME_COUNT - 1) + 1e-6));
}

export type HeroFrameChangeDetail = {
  frameIndex: number;
  frameNumber: number;
  progress: number;
  frameSrc: string;
};

export function dispatchHeroFrameChange(detail: HeroFrameChangeDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("hero-frame-change", { detail }));
}
