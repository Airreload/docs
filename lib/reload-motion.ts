/** Frame-rate-independent easing, in radians and seconds. */
export function advanceReloadMotion(
  speed: number,
  angle: number,
  active: boolean,
  dt: number,
) {
  const target = active ? 0.42 : 0;
  const rate = active ? 1.35 : 0.85;
  const decay = Math.exp(-rate * dt);
  const nextSpeed = target + (speed - target) * decay;
  // Integrate the exponential instead of depending on frame count.
  const travel = target * dt + ((speed - target) * (1 - decay)) / rate;
  return { speed: nextSpeed, angle: angle - travel };
}
