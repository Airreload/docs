import test from "node:test";
import assert from "node:assert/strict";
import { analyticsStorageKey, createAnalytics } from "../lib/analytics.ts";

const settle = () => new Promise((resolve) => setImmediate(resolve));
function fixture({ blocked = false, failStorage = false, send } = {}) {
  const saved = new Map();
  const events = [];
  let sequence = 0;
  const analytics = createAnalytics({
    storage: {
      getItem(key) { if (failStorage) throw Error("denied"); return saved.get(key) ?? null; },
      setItem(key, value) { if (failStorage) throw Error("denied"); saved.set(key, value); },
    },
    uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`,
    blocked: () => blocked,
    origin: "https://example.test",
    referrer: "https://github.com/private/repo?secret=private",
    send: send ?? (async (body) => { events.push(JSON.parse(body)); }),
  }, "phc_synthetic_test");
  analytics.configurePages(["/docs", "/docs/quickstart"]);
  return { analytics, saved, events };
}

test("default enabled; views share an ID and Strict Mode does not duplicate views", async () => {
  const { analytics, events } = fixture();
  assert.equal(analytics.enabled(), true);
  analytics.track("$pageview", "/");
  analytics.track("$pageview", "/");
  await settle();
  analytics.track("$pageview", "/docs");
  await settle();
  assert.equal(events.length, 2);
  assert.equal(events[0].properties.distinct_id, events[1].properties.distinct_id);
  analytics.track("$pageview", "/");
  await settle();
  assert.equal(events.length, 3);
});

test("opt-out persists, removes ID, and re-enabling creates a new identity", async () => {
  const { analytics, events, saved } = fixture();
  analytics.track("$pageview", "/");
  await settle();
  const old = events[0].properties.distinct_id;
  assert.equal(analytics.setEnabled(false), true);
  assert.deepEqual(JSON.parse(saved.get(analyticsStorageKey)), { enabled: false });
  analytics.track("$pageview", "/docs");
  await settle();
  assert.equal(events.length, 1);
  analytics.setEnabled(true);
  analytics.track("$pageview", "/docs");
  await settle();
  assert.notEqual(events[1].properties.distinct_id, old);
});

test("privacy signals and unavailable storage suppress all collection", async () => {
  for (const options of [{ blocked: true }, { failStorage: true }]) {
    const { analytics, events, saved } = fixture(options);
    analytics.track("$pageview", "/");
    await settle();
    assert.equal(analytics.enabled(), false);
    assert.equal(events.length, 0);
    assert.equal(saved.size, 0);
  }
});

test("invalid preferences fail closed", async () => {
  for (const value of ["{", "null", "[]", '{"enabled":"yes"}', '{"enabled":true,"id":"secret"}']) {
    const { analytics, events, saved } = fixture();
    saved.set(analyticsStorageKey, value);
    analytics.track("$pageview", "/");
    await settle();
    assert.equal(events.length, 0);
  }
});

test("only fixed properties, route paths, and referral categories leave the browser", async () => {
  const { analytics, events } = fixture();
  analytics.track("$pageview", "/private-user-name");
  analytics.track("$pageview", "/docs?secret=password");
  analytics.track("web_install_command_copied", "/", "mac");
  await settle();
  assert.equal(events.length, 1);
  const props = events[0].properties;
  assert.deepEqual(Object.keys(props).sort(), ["distinct_id", "surface", "$process_person_profile",
    "$geoip_disable", "$ip", "$pathname", "$current_url", "referral_source", "platform"].sort());
  assert.equal(props.$current_url, "https://example.test/");
  assert.equal(props.$geoip_disable, true);
  assert.equal(props.$process_person_profile, false);
  assert.equal(props.$ip, null);
  assert.equal(props.referral_source, "github");
  assert.equal(JSON.stringify(events).includes("private"), false);
});

test("revocation before dispatch prevents pending events and observes other tabs", async () => {
  const { analytics, events, saved } = fixture();
  analytics.track("$pageview", "/");
  saved.set(analyticsStorageKey, '{"enabled":false}');
  analytics.refreshPreference();
  await settle();
  assert.equal(events.length, 0);
});

test("network failures do not escape or retry", async () => {
  let calls = 0;
  const { analytics } = fixture({ send: async () => { calls++; throw Error("offline"); } });
  assert.doesNotThrow(() => analytics.track("$pageview", "/"));
  await settle();
  assert.equal(calls, 1);
});

test("pending requests are bounded and aborted on opt-out", async () => {
  const signals = [];
  const { analytics } = fixture({ send: (_, signal) => new Promise((resolve) => {
    signals.push(signal);
    signal.addEventListener("abort", resolve, { once: true });
  }) });
  for (let i = 0; i < 20; i++) analytics.track("web_setup_prompt_copied", "/");
  await settle();
  assert.equal(signals.length, 4);
  analytics.setEnabled(false);
  assert.equal(signals.every((signal) => signal.aborted), true);
  await settle();
});
