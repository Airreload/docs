"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { analyticsChanged, analyticsStorageKey, browserAnalytics } from "@/lib/analytics";

export function Analytics({ pages }: { pages: string[] }) {
  const pathname = usePathname();
  useEffect(() => {
    const analytics = browserAnalytics();
    analytics?.configurePages(pages);
    if (pathname) analytics?.track("$pageview", pathname);
  }, [pathname, pages]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === analyticsStorageKey || event.key === null) {
        browserAnalytics()?.refreshPreference();
        window.dispatchEvent(new Event(analyticsChanged));
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const url = new URL(link.href);
      if (url.origin === "https://github.com" &&
          /^\/Airreload\/airreload-go\/releases(?:\/|$)/.test(url.pathname)) {
        browserAnalytics()?.track("web_go_download_clicked", window.location.pathname);
      }
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}

export function AnalyticsPreference() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const update = () => setEnabled(browserAnalytics()?.enabled() ?? false);
    update();
    window.addEventListener(analyticsChanged, update);
    return () => window.removeEventListener(analyticsChanged, update);
  }, []);
  function toggle() {
    const analytics = browserAnalytics();
    const saved = analytics?.setEnabled(!enabled);
    setEnabled(analytics?.enabled() ?? false);
    setMessage(saved ? "Preference saved for this browser." :
      "Browser storage is unavailable. Analytics is off for this visit.");
    window.dispatchEvent(new Event(analyticsChanged));
  }
  return (
    <aside className="analytics-preference" aria-label="Analytics preference">
      <details>
        <summary>Privacy &amp; analytics</summary>
        <p>Analytics is on by default. We send page views, command copies, download-link clicks,
          and a random browser ID to PostHog in the US. No recordings, form contents,
          search queries, or URL query parameters. PostHog receives your connection IP.
          Your browser’s privacy signals are respected.</p>
        <button type="button" disabled={enabled === null} aria-pressed={enabled ?? false}
          onClick={toggle}>Analytics: {enabled === null ? "checking…" : enabled ? "on — turn off" : "off — turn on"}</button>
        <p role="status">{message || "Turning off removes the local browser ID; previously sent events remain in PostHog."}</p>
      </details>
    </aside>
  );
}
