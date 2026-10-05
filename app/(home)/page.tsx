import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Zap } from "lucide-react";
import { ReloadArtwork } from "@/components/reload-artwork";
import { StartBuildingButton } from "@/components/start-building-button";
import { CopySetupPrompt } from "@/components/copy-setup-prompt";
import {
  ReloadDemo,
  InstallCommand,
  MobileNavigation,
} from "@/components/landing-interactions";

export const metadata: Metadata = {
  title: { absolute: "Airreload — Flutter, untethered." },
  description:
    "From your editor to the phone in your hand. Pair, install, and hot reload your Flutter Android app over Wi-Fi with Airreload.",
};

function Logo() {
  return (
    <span className="air-logo">
      <span className="air-logo-mark">
        <Zap size={19} fill="currentColor" strokeWidth={1.5} />
      </span>
      airreload<span className="air-beta">BETA</span>
    </span>
  );
}

export default function HomePage() {
  return (
    <>
      <a className="air-skip" href="#main">
        Skip to content
      </a>
      <header className="air-header">
        <div className="air-nav">
          <Link href="/" aria-label="Airreload home">
            <Logo />
          </Link>
          <nav className="air-desktop-nav" aria-label="Main navigation">
            <Link href="/docs">Documentation</Link>
            <a href="#how-it-works">How it works</a>
            <a
              href="https://github.com/Airreload/airreload-go/releases"
              target="_blank"
              rel="noreferrer"
            >
              Airreload Go <ArrowUpRight size={12} />
            </a>
          </nav>
          <div className="air-nav-actions">
            <a
              className="air-github"
              href="https://github.com/Airreload"
              target="_blank"
              rel="noreferrer"
              aria-label="Airreload on GitHub"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.77-.244.77-.542 0-.267-.01-.974-.015-1.912-3.13.68-3.791-1.508-3.791-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.022-.7.078-.685.078-.685 1.13.08 1.724 1.16 1.724 1.16 1.005 1.721 2.637 1.224 3.28.936.103-.728.393-1.224.715-1.506-2.498-.284-5.124-1.25-5.124-5.563 0-1.229.439-2.234 1.159-3.022-.117-.284-.502-1.43.11-2.981 0 0 .944-.303 3.094 1.154A10.79 10.79 0 0 1 12 6.19c.956.005 1.918.13 2.817.378 2.148-1.457 3.09-1.154 3.09-1.154.615 1.551.23 2.697.113 2.981.722.788 1.157 1.793 1.157 3.022 0 4.325-2.63 5.276-5.136 5.554.404.349.765 1.04.765 2.097 0 1.515-.014 2.738-.014 3.11 0 .3.203.651.774.541A11.25 11.25 0 0 0 12 .75Z" />
              </svg>
            </a>
            <Link className="air-nav-cta" href="/docs/quickstart">
              Get started <ArrowUpRight size={13} />
            </Link>
            <MobileNavigation />
          </div>
        </div>
      </header>

      <main id="main" className="air-main">
        <section className="air-hero" aria-labelledby="hero-title">
          <div className="air-hero-glow" aria-hidden="true" />
          <div className="air-grain" aria-hidden="true" />
          <ReloadArtwork />
          <div className="air-hero-copy">
            <h1
              id="hero-title"
              aria-label="Flutter Run. No cable. No adb. No Developer Option."
            >
              Flutter Run
              <br />
              <span
                className="air-flip-headline air-flip-three"
                aria-hidden="true"
              >
                <span className="air-flip-line">No cable.</span>
                <span className="air-flip-line">No adb.</span>
                <span className="air-flip-line air-flip-long">
                  No Developer Option.
                </span>
              </span>
            </h1>
            <p>
              Your editor. Your phone. Nothing in between.
              <br className="air-desktop-break" /> Build, install, and hot
              reload over Wi-Fi.
              <br className="air-desktop-break" /> Leave the cable behind. Stay
              in the flow.
            </p>
            <div className="air-hero-actions">
              <StartBuildingButton />
              <a
                href="#how-it-works"
                className="air-button air-button-secondary"
              >
                See how it works <ArrowDown size={15} />
              </a>
            </div>
          </div>
          <ReloadDemo />
        </section>

        <section className="air-install" aria-labelledby="install-title">
          <h2
            id="install-title"
            className="air-install-title"
            aria-label="Goodbye, cable. Goodbye, developer mode. Hello, Airreload."
          >
            <span className="air-flip-headline" aria-hidden="true">
              <span className="air-flip-line">Goodbye, cable.</span>
              <span className="air-flip-line air-install-flip-second">
                Goodbye, developer mode.
              </span>
            </span>
            <span className="air-install-welcome" aria-hidden="true">
              Hello, Airreload.
            </span>
          </h2>
          <InstallCommand />
          <CopySetupPrompt />
        </section>
      </main>
      <footer className="air-footer">
        <Link href="/" aria-label="Airreload home">
          <Logo />
        </Link>
        <p>Made for the joy of building.</p>
        <div>
          <Link href="/docs">Docs</Link>
          <a
            href="https://github.com/Airreload"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight size={12} />
          </a>
          <span>Flutter, untethered.</span>
        </div>
      </footer>
    </>
  );
}
