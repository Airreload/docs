export const analyticsStorageKey = "airreload.analytics.v1";
export const analyticsChanged = "airreload-analytics-changed";
const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN ??
  "phc_zSnDnDZpCrxj27TRpXksGrp6RPhyZyYMmXyYx8q9XxFP";

type Event = "$pageview" | "web_install_command_copied" |
  "web_setup_prompt_copied" | "web_go_download_clicked";
type Platform = "mac" | "windows" | "linux";
type Preference = { enabled: boolean; id?: string };
type Runtime = {
  storage: Pick<Storage, "getItem" | "setItem">;
  uuid: () => string;
  blocked: () => boolean;
  origin: string;
  referrer: string;
  send: (body: string, signal: AbortSignal) => Promise<unknown>;
};

// Only known routes and fixed event/property categories can leave the browser.
export function createAnalytics(runtime: Runtime, projectToken = token) {
  let pages = new Set(["/"]);
  let memoryOptOut = false;
  let lastPage: string | undefined;
  let sent = 0;
  const pending = new Set<AbortController>();
  const read = (): Preference => {
    try {
      const raw = runtime.storage.getItem(analyticsStorageKey);
      if (raw === null) return { enabled: true };
      if (raw.length > 1024) return { enabled: false };
      const value = JSON.parse(raw);
      if (typeof value?.enabled !== "boolean" ||
          (value.id !== undefined && !/^[a-f0-9-]{36}$/i.test(value.id))) {
        return { enabled: false };
      }
      return value;
    } catch { return { enabled: false }; }
  };
  const enabled = () => !memoryOptOut && !runtime.blocked() && read().enabled;
  const cancel = () => { for (const controller of pending) controller.abort(); };
  return {
    enabled,
    configurePages(paths: string[]) { pages = new Set(["/", ...paths]); },
    refreshPreference() { if (!enabled()) cancel(); },
    setEnabled(value: boolean) {
      if (!value) { memoryOptOut = true; cancel(); }
      try {
        const previous = read();
        runtime.storage.setItem(analyticsStorageKey, JSON.stringify({
          enabled: value,
          ...(value && previous.enabled && previous.id ? { id: previous.id } : {}),
        }));
        memoryOptOut = !value;
        lastPage = undefined;
        return true;
      } catch { return false; }
    },
    track(event: Event, pathname: string, platform?: Platform) {
      try {
        if (!enabled() || !/^phc_[A-Za-z0-9_-]+$/.test(projectToken) ||
            pending.size >= 4 || sent >= 100 || !pages.has(pathname)) return;
        if (!["$pageview", "web_install_command_copied", "web_setup_prompt_copied",
          "web_go_download_clicked"].includes(event)) return;
        if (event === "$pageview" && lastPage === pathname) return;
        const preference = read();
        const id = preference.id ?? runtime.uuid();
        if (!preference.id) runtime.storage.setItem(analyticsStorageKey,
          JSON.stringify({ enabled: true, id }));
        const source = (() => {
          if (!runtime.referrer) return "direct";
          try {
            const host = new URL(runtime.referrer).hostname;
            if (host === new URL(runtime.origin).hostname) return "internal";
            if (host === "github.com") return "github";
            if (host === "google.com" || host === "www.google.com") return "google";
          } catch { /* No raw referrers are forwarded. */ }
          return "other";
        })();
        const body = JSON.stringify({ token: projectToken, event,
          timestamp: new Date().toISOString(), properties: {
            distinct_id: id, surface: "web", $process_person_profile: false,
            $geoip_disable: true, $ip: null, $pathname: pathname,
            $current_url: new URL(pathname, runtime.origin).toString(),
            referral_source: source,
            ...(event === "web_install_command_copied" &&
              (platform === "mac" || platform === "windows" || platform === "linux") ? { platform } : {}),
          },
        });
        if (event === "$pageview") lastPage = pathname;
        sent++;
        const controller = new AbortController();
        pending.add(controller);
        const timer = setTimeout(() => controller.abort(), 1500);
        void Promise.resolve().then(() => {
          if (!enabled() || controller.signal.aborted) return;
          return runtime.send(body, controller.signal);
        }).catch(() => {}).finally(() => {
          clearTimeout(timer); pending.delete(controller);
        });
      } catch { /* Analytics never interrupts navigation or copying. */ }
    },
  };
}

let instance: ReturnType<typeof createAnalytics> | undefined;
export function browserAnalytics() {
  if (typeof window === "undefined") return undefined;
  instance ??= createAnalytics({
    storage: {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    },
    uuid: () => crypto.randomUUID(),
    blocked: () => process.env.NODE_ENV !== "production" ||
      process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1" ||
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true,
    origin: window.location.origin,
    referrer: document.referrer,
    send: (body, signal) => fetch("https://us.i.posthog.com/i/v0/e/", {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
      signal, keepalive: true, credentials: "omit", redirect: "error",
      referrerPolicy: "no-referrer",
    }),
  });
  return instance;
}

export function trackCopy(event: "web_install_command_copied" | "web_setup_prompt_copied", platform?: Platform) {
  browserAnalytics()?.track(event, window.location.pathname, platform);
}
