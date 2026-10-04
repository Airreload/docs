"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Menu,
  Plus,
  Signal,
  RotateCcw,
  Wifi,
  X,
  Zap,
} from "lucide-react";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="air-mobile-nav">
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="air-mobile-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <nav id="air-mobile-menu" aria-label="Mobile navigation">
          <Link onClick={() => setOpen(false)} href="/docs">
            Documentation
          </Link>
          <a onClick={() => setOpen(false)} href="#how-it-works">
            How it works
          </a>
          <a
            onClick={() => setOpen(false)}
            href="https://github.com/Airreload/airreload-go/releases"
          >
            Get Airreload Go
          </a>
        </nav>
      )}
    </div>
  );
}

export function ReloadDemo() {
  const [reloaded, setReloaded] = useState(false);
  const [action, setAction] = useState<"reload" | "restart" | null>(null);
  const [lastAction, setLastAction] = useState<"reload" | "restart" | null>(
    null,
  );
  const loading = action !== null;
  const [taps, setTaps] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function runAction(nextAction: "reload" | "restart") {
    if (loading) return;
    setAction(nextAction);
    timer.current = setTimeout(() => {
      if (nextAction === "reload") setReloaded((value) => !value);
      else setTaps(0);
      setLastAction(nextAction);
      setAction(null);
    }, 1200);
  }

  const nextLabel = (action === "reload" ? !reloaded : reloaded)
    ? "Hello, flow."
    : "Hello, world.";
  const codeLines = [
    <>
      <b>return</b>
      {" Scaffold("}
    </>,
    "  body: Center(",
    "    child: Column(",
    "      children: [",
    <>
      {"        Text("}
      <em>&apos;{nextLabel}&apos;</em>
      {"),"}
    </>,
    <>
      {"        Text("}
      <em>{"'Taps: $count'"}</em>
      {"),"}
    </>,
    "        FilledButton(",
    "          onPressed: incrementCount,",
    <>
      {"          child: "}
      <b>const</b>
      {" Text("}
      <em>&apos;+&apos;</em>
      {"),"}
    </>,
    "        ),",
    "      ],",
    "    ),",
    "  ),",
    ");",
  ];

  return (
    <div
      id="how-it-works"
      className={`air-demo ${loading ? "is-sending" : ""} ${action === "restart" ? "is-restarting" : ""}`}
      role="group"
      aria-label="Interactive illustration of hot reload and hot restart on your Android phone"
    >
      <div className="air-demo-stage">
        <div className="air-computer">
          <div className="air-hardware-label">
            <span>01</span> ON YOUR COMPUTER
          </div>
          <div className="air-editor-window">
            <div className="air-demo-toolbar">
              <div className="air-window-dots">
                <i />
                <i />
                <i />
              </div>
              <span>your next great idea</span>
            </div>
            <div className="air-editor">
              <div className="air-editor-tab">
                <span className="air-dart-icon">◈</span> main.dart{" "}
                <span>M</span>
              </div>
              <div className="air-code" aria-label="Example Dart code">
                {codeLines.map((line, index) => (
                  <div
                    key={index}
                    className={index === 4 ? "air-code-highlight" : undefined}
                  >
                    <span>{index + 1}</span>
                    <code>{line}</code>
                  </div>
                ))}
              </div>
              <div className="air-terminal">
                <div>
                  <span>TERMINAL</span>
                  <span>zsh</span>
                </div>
                <p>
                  <span className="air-terminal-prompt">❯</span> airreload run
                </p>
                <p className="air-terminal-muted">
                  <Check size={12} /> Connected to your Android device
                </p>
                <p className="air-terminal-result" role="status">
                  {action === "restart"
                    ? "Restarting your app over Wi-Fi…"
                    : action === "reload"
                      ? "Sending your changes over Wi-Fi…"
                      : lastAction === "restart"
                        ? "✓ Hot restart complete. App state reset."
                        : lastAction === "reload"
                          ? "✓ Hot reload complete. App state preserved."
                          : "Your app is running. Try the controls below."}
                </p>
              </div>
            </div>
            <div
              className="air-editor-controls"
              role="group"
              aria-label="Flutter debug controls"
            >
              <div className="air-debug-action">
                <button
                  type="button"
                  className="air-hot-reload"
                  onClick={() => runAction("reload")}
                  disabled={loading}
                  aria-label="Hot reload"
                  aria-describedby="air-reload-hint"
                  title="Hot reload — update code and keep app state"
                >
                  <Zap
                    size={22}
                    fill="currentColor"
                    strokeWidth={1.5}
                    className={action === "reload" ? "air-reload-flash" : ""}
                  />
                </button>
                <div id="air-reload-hint">
                  <strong>Press to hot reload</strong>
                  <span>Update code. Keep state.</span>
                </div>
              </div>
              <div className="air-debug-action">
                <button
                  type="button"
                  className="air-hot-restart"
                  onClick={() => runAction("restart")}
                  disabled={loading}
                  aria-label="Hot restart"
                  aria-describedby="air-restart-hint"
                  title="Hot restart — restart the app and reset its state"
                >
                  <RotateCcw
                    size={23}
                    strokeWidth={2}
                    className={action === "restart" ? "air-spinning" : ""}
                  />
                </button>
                <div id="air-restart-hint">
                  <strong>Press to hot restart</strong>
                  <span>Start fresh. Reset state.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="air-wireless" aria-hidden="true">
          <div className="air-wireless-track">
            <span className="air-data-packet" />
            <span className="air-wifi-node">
              <Wifi size={21} />
            </span>
          </div>
          <span>
            {action === "restart"
              ? "RESTARTING APP"
              : loading
                ? "SENDING CHANGES"
                : "OVER WI-FI"}
          </span>
        </div>

        <div className={`air-device-preview ${reloaded ? "is-reloaded" : ""}`}>
          <div className="air-hardware-label">
            <span>02</span> YOUR ACTUAL PHONE
          </div>
          <div className="air-phone-angle">
            <div className="air-phone">
              <span className="air-phone-volume" aria-hidden="true" />
              <span className="air-phone-power" aria-hidden="true" />
              <div className="air-phone-screen">
                <div className="air-phone-camera" aria-hidden="true" />
                <div className="air-phone-status" aria-hidden="true">
                  <span>9:41</span>
                  <Signal size={12} />
                  <Wifi size={12} />
                  <span className="air-battery" />
                </div>
                <div className="air-phone-app">
                  <h3>{reloaded ? "Hello, flow." : "Hello, world."}</h3>
                  <p>A little change. A little magic.</p>
                  <div className="air-tap-counter">
                    <span>Taps</span>
                    <output aria-live="polite" aria-label="Tap count">
                      {taps}
                    </output>
                    <button
                      type="button"
                      onClick={() => setTaps((value) => value + 1)}
                      aria-label="Increase phone tap count"
                      disabled={action === "restart"}
                    >
                      <Plus size={23} />
                    </button>
                  </div>
                  <span className="air-tap-hint">Go ahead. Give it a tap.</span>
                  <div
                    className={`air-phone-toast ${lastAction && !loading ? "is-visible" : ""}`}
                    aria-hidden={!lastAction || loading}
                  >
                    <Check size={12} />
                    {lastAction === "restart"
                      ? "Fresh start. App state reset."
                      : `New code. Same ${taps} ${taps === 1 ? "tap" : "taps"}.`}
                  </div>
                </div>
                <div className="air-phone-home" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="air-demo-instruction">
        Tap + on the phone, then try both controls.
      </p>
    </div>
  );
}

const commands = {
  linux: [
    "git clone https://github.com/Airreload/cli.git &&",
    "cd cli &&",
    "dart pub get &&",
    "dart compile exe bin/airreload.dart -o bin/airreload &&",
    "./bin/airreload doctor",
  ].join("\n"),
  mac: "curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/Airreload/installer/main/install.sh | bash",
  windows:
    "iwr -UseBasicParsing 'https://raw.githubusercontent.com/Airreload/installer/main/install.ps1' | iex",
};

export function InstallCommand() {
  const [platform, setPlatform] = useState<keyof typeof commands>("mac");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(commands[platform]);
      setCopied(true);
      setCopyError(false);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className="air-install-terminal">
      <div
        className="air-install-tabs"
        role="group"
        aria-label="Installation platform"
      >
        <button
          type="button"
          aria-pressed={platform === "mac"}
          onClick={() => {
            setPlatform("mac");
            setCopied(false);
            setCopyError(false);
          }}
        >
          macOS
        </button>
        <button
          type="button"
          aria-pressed={platform === "windows"}
          onClick={() => {
            setPlatform("windows");
            setCopied(false);
            setCopyError(false);
          }}
        >
          Windows
        </button>
        <button
          type="button"
          aria-pressed={platform === "linux"}
          onClick={() => {
            setPlatform("linux");
            setCopied(false);
            setCopyError(false);
          }}
        >
          Linux
        </button>
        <span>
          {platform === "linux"
            ? "From source"
            : platform === "mac"
              ? "Apple Silicon"
              : "x64 · PowerShell"}
        </span>
      </div>
      <div className="air-install-command">
        <span>$</span>
        <code>{commands[platform]}</code>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Command copied" : "Copy install command"}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      <div className="air-install-hint" aria-live="polite">
        {copyError
          ? "Copy unavailable. Select and copy the command above."
          : copied
            ? "Copied. Your terminal is up next."
            : platform === "linux"
              ? "Requires Dart 3.13+ and Git. Keep the executable in cli/bin; see the source guide to run your project."
              : "Then open your Flutter project and run airreload run."}
      </div>
      <div className="air-install-bottom">
        <span>
          {platform === "linux"
            ? "Source build · Android SDK + JDK required"
            : "Android build tools + JDK required"}
        </span>
        <Link
          href={
            platform === "linux"
              ? "/docs/reference/cli#source-installation"
              : "/docs/quickstart"
          }
        >
          {platform === "linux" ? "Source guide" : "Setup guide"}{" "}
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
