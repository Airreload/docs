import test from "node:test";
import assert from "node:assert/strict";
import { advanceReloadMotion } from "../lib/reload-motion.ts";

function simulate(fps, seconds, active, state = { speed: 0, angle: 0 }) {
  for (let i = 0; i < fps * seconds; i++) {
    state = advanceReloadMotion(state.speed, state.angle, active, 1 / fps);
  }
  return state;
}

test("hover accelerates gently and stays below the target speed", () => {
  const first = advanceReloadMotion(0, 0, true, 1 / 60);
  const moving = simulate(60, 3, true);
  assert.ok(first.speed > 0 && first.speed < 0.02);
  assert.ok(moving.speed > 0.4 && moving.speed < 0.42);
  assert.ok(moving.angle < 0);
});

test("leaving keeps the ring moving forward as it coasts to rest", () => {
  const moving = simulate(60, 3, true);
  const coast = simulate(60, 1, false, moving);
  const stopped = simulate(60, 9, false, moving);
  assert.ok(coast.speed > 0 && coast.speed < moving.speed);
  assert.ok(coast.angle < moving.angle);
  assert.ok(stopped.speed < 0.001);
  assert.ok(stopped.angle < coast.angle);
});

test("motion has the same timing on 30 Hz and 120 Hz displays", () => {
  const low = simulate(30, 4, true);
  const high = simulate(120, 4, true);
  assert.ok(Math.abs(low.angle - high.angle) < 1e-10);
  assert.ok(Math.abs(low.speed - high.speed) < 1e-10);
});
