"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

// MetalFx checks WebGL support during render, so mount it only in the browser.
// The real link remains available while the shader loads or without JavaScript.
const MetalFx = dynamic(
  () => import("metal-fx").then((module) => module.MetalFx),
  {
    ssr: false,
    loading: () => <StartBuildingLink />,
  },
);

function StartBuildingLink() {
  return (
    <Link href="/docs/quickstart" className="air-button air-button-primary">
      Start building <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function prefersReducedMotion() {
  return window.matchMedia(motionQuery).matches;
}

export function StartBuildingButton() {
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion,
    prefersReducedMotion,
    () => true,
  );

  return (
    <MetalFx
      className="air-start-metal"
      variant="button"
      preset="gold"
      theme="dark"
      strength={1}
      ringCssPx={1.5}
      paused={reducedMotion}
      normalizeHostStyles={false}
    >
      <StartBuildingLink />
    </MetalFx>
  );
}
