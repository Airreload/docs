import Link from "next/link";
import { ArrowRight, Code2, QrCode, Zap } from "lucide-react";

export function DocsIntro() {
  return (
    <div className="docs-intro not-prose">
      <div className="intro-copy">
        <span className="eyebrow">
          <span /> FLUTTER, IN YOUR HANDS
        </span>
        <h2>
          Your code.
          <br />
          <span>Your actual phone.</span>
        </h2>
        <p>
          Build on your computer. Scan with your phone. Keep your Flutter
          Android app moving with hot reload.
        </p>
        <div className="docs-intro-benefits">
          <span>No cable</span>
          <span>No ADB</span>
          <span>No developer options</span>
        </div>
        <Link href="/docs/quickstart" className="start-link">
          Run your first session <ArrowRight size={16} />
        </Link>
      </div>
      <div
        className="session-preview"
        aria-label="Airreload workflow: run, pair, hot reload"
      >
        <div className="terminal-top">
          <span />
          <span />
          <span />
          <span className="terminal-label">a little less friction</span>
        </div>
        <div className="terminal-command">
          <span>$</span> airreload run
        </div>
        <ol className="session-steps">
          <li>
            <Code2 size={17} />
            <div>
              <strong>Start on your computer</strong>
              <span>Inside your Flutter project</span>
            </div>
          </li>
          <li>
            <QrCode size={17} />
            <div>
              <strong>Pair with Airreload Go</strong>
              <span>Scan. Install. Open your app.</span>
            </div>
          </li>
          <li>
            <Zap size={17} />
            <div>
              <strong>Make it. Reload it.</strong>
              <span>
                Edit your Dart code, then press <kbd>r</kbd>
              </span>
            </div>
          </li>
        </ol>
        <div className="session-footer">
          <span /> Android · Local network · Debug builds
        </div>
      </div>
    </div>
  );
}
