"use client";

import { useEffect, useRef, useState } from "react";
import type { ReloadScene } from "./reload-artwork-scene";

export function ReloadArtwork() {
  const host = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReloadScene | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import("./reload-artwork-scene")
      .then(({ createReloadScene }) => {
        if (cancelled || !canvas.current || !host.current) return;
        try {
          const controller = createReloadScene(canvas.current, host.current);
          scene.current = controller;
          dispose = controller.dispose;
          setReady(true);
        } catch {
          // The original artwork remains visible when WebGL is unavailable.
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      scene.current = null;
      dispose?.();
    };
  }, []);

  return (
    <button
      ref={host}
      type="button"
      className="air-reload-art"
      data-ready={ready}
      aria-label="Spin the 3D reload symbol"
      onClick={() => scene.current?.spin()}
    >
      <ArtworkFallback />
      <canvas ref={canvas} aria-hidden="true" />
    </button>
  );
}

function ArtworkFallback() {
  return (
    <svg
      className="air-reload-fallback"
      viewBox="0 0 540 540"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="air-dots"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="1.7" fill="white" />
        </pattern>
        <mask id="air-dot-mask">
          <rect width="540" height="540" fill="url(#air-dots)" />
        </mask>
        <linearGradient
          id="air-ring-color"
          x1="120"
          y1="60"
          x2="420"
          y2="460"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffe6a0" />
          <stop offset=".4" stopColor="#ffac4b" />
          <stop offset="1" stopColor="#fa4d16" />
        </linearGradient>
      </defs>
      <g mask="url(#air-dot-mask)" fill="url(#air-ring-color)">
        <path d="M435 165A193 193 0 0 0 91 194l57 22A132 132 0 0 1 383 199l-48 30 143 26 8-145-51 55Z" />
        <path d="M105 375a193 193 0 0 0 344-29l-57-22a132 132 0 0 1-235 17l48-30-143-26-8 145 51-55Z" />
      </g>
      <circle
        cx="270"
        cy="270"
        r="240"
        stroke="#ffb967"
        strokeOpacity=".12"
        strokeDasharray="2 9"
      />
      <path
        d="m279 198-53 88h39l-6 57 57-93h-41l4-52Z"
        fill="url(#air-ring-color)"
        opacity=".85"
      />
    </svg>
  );
}
