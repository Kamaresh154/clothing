"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-scrubbed fashion-film hero.
 *
 * Put the final photorealistic outfit-change film at:
 *   public/fashion-scroll.mp4
 *
 * The video never autoplay-plays. Scroll position controls currentTime so
 * scrolling forward and backward reverses the clothing transformation exactly.
 */
export default function ScrollFashionVideo({ progress }: { progress: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;

    const onLoaded = () => setReady(true);
    const onError = () => setFailed(true);
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    targetTime.current = progress;
  }, [progress]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video && ready && Number.isFinite(video.duration) && video.duration > 0) {
        const desired = targetTime.current * video.duration;
        const delta = desired - video.currentTime;
        // Gentle smoothing keeps fast wheel/touch movement cinematic while
        // preserving exact reversibility.
        if (Math.abs(delta) > 0.001) {
          video.currentTime += delta * 0.32;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  return (
    <div className="absolute inset-0 bg-[#08080a]">
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        src="/clothing/fashion-scroll.mp4"
        muted
        playsInline
        preload="auto"
        controls={false}
        aria-label="Cinematic men's fashion outfit transformation"
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="display text-3xl md:text-5xl tracking-tight">THE COLLECTION</div>
            <div className="mono mt-4 text-[9px] tracking-[0.24em] text-white/35">
              {failed ? "FASHION FILM ASSET REQUIRED" : "PRELOADING FASHION FILM"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
