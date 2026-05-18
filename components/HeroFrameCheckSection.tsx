"use client";

import { useEffect, useState } from "react";
import {
  FRAME_COUNT,
  LAST_FRAME_PATH,
  type HeroFrameChangeDetail
} from "@/lib/heroFrames";

export default function HeroFrameCheckSection() {
  const [live, setLive] = useState<HeroFrameChangeDetail | null>(null);

  useEffect(() => {
    const onFrameChange = (event: Event) => {
      setLive((event as CustomEvent<HeroFrameChangeDetail>).detail);
    };

    window.addEventListener("hero-frame-change", onFrameChange);
    return () => window.removeEventListener("hero-frame-change", onFrameChange);
  }, []);

  const matchesLast = live?.frameNumber === FRAME_COUNT;

  return (
    <section className="frame-check border-t border-[var(--color-stone-moss)] bg-[var(--color-canvas-ice)] px-5 py-16 text-[var(--color-adaline-ink)]" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <p className="frame-check-label">בדיקת פריים אחרון</p>
        <h2 className="frame-check-title">השוואה: גלילה בהירו מול קובץ frame_0302.jpg</h2>
        <p className="frame-check-note">
          גלול את ההירו עד הסוף. אם הפריים החי שונה מהקובץ — יש בעיה במיפוי הגלילה, לא בקובץ עצמו.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <article className="frame-check-card">
            <h3 className="frame-check-card-title">קובץ אחרון (מקור)</h3>
            <p className="frame-check-card-meta">/hero-frames/frame_0302.jpg</p>
            <div className="frame-check-media">
              <img src={LAST_FRAME_PATH} alt="פריים אחרון מהקובץ" className="h-full w-full object-cover" />
            </div>
          </article>

          <article className="frame-check-card">
            <h3 className="frame-check-card-title">מה שההירו מציג עכשיו</h3>
            <p className="frame-check-card-meta">
              {live
                ? `פריים ${live.frameNumber} / ${FRAME_COUNT} · ${(live.progress * 100).toFixed(1)}%`
                : "גלול את ההירו כדי לעדכן"}
            </p>
            <div
              className={`frame-check-status ${matchesLast ? "frame-check-status--ok" : live ? "frame-check-status--warn" : ""}`}
            >
              {live
                ? matchesLast
                  ? "תואם לפריים האחרון"
                  : "לא תואם — עדיין לא הגעת לפריים 302"
                : "ממתין לגלילה"}
            </div>
            <div className="frame-check-media">
              {live ? (
                <img src={live.frameSrc} alt="פריים נוכחי מההירו" className="h-full w-full object-cover" />
              ) : (
                <div className="frame-check-placeholder">אין נתונים עדיין</div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
