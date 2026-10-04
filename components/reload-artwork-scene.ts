import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { advanceReloadMotion } from "../lib/reload-motion";

export interface ReloadScene {
  spin: () => void;
  dispose: () => void;
}

const arrows = new Path2D(
  "M435 165A193 193 0 0 0 91 194l57 22A132 132 0 0 1 383 199l-48 30 143 26 8-145-51 55Z M105 375a193 193 0 0 0 344-29l-57-22a132 132 0 0 1-235 17l48-30-143-26-8 145 51-55Z",
);

export function createReloadScene(
  canvas: HTMLCanvasElement,
  host: HTMLButtonElement,
): ReloadScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 1, 2000);
  camera.position.z = 870;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffefca, 2);
  key.position.set(-200, 300, 400);
  const rim = new THREE.DirectionalLight(0xff782b, 2);
  rim.position.set(300, -200, 100);
  scene.add(key, rim, new THREE.AmbientLight(0xffd7a0, 0.7));
  const model = new THREE.Group();
  model.rotation.set(0.24, -0.34, 0.18);
  scene.add(model);
  const ring = new THREE.Group();
  model.add(ring);

  const sampler = document.createElement("canvas").getContext("2d")!;
  const points: Array<[number, number]> = [];
  for (let y = 3; y < 540; y += 7) {
    for (let x = 3; x < 540; x += 7) {
      if (sampler.isPointInPath(arrows, x, y)) points.push([x, y]);
    }
  }
  // Each dot is a rounded metal pin with physical depth, drawn in one batch.
  const pinGeometry = new THREE.SphereGeometry(1, 12, 8);
  const pinMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.72,
    roughness: 0.3,
  });
  const pins = new THREE.InstancedMesh(pinGeometry, pinMaterial, points.length);
  const transform = new THREE.Object3D();
  const gold = new THREE.Color("#ffda82");
  const copper = new THREE.Color("#e96726");
  points.forEach(([x, y], i) => {
    transform.position.set(x - 270, 270 - y, 0);
    transform.scale.set(1.95, 1.95, 6.5);
    transform.updateMatrix();
    pins.setMatrixAt(i, transform.matrix);
    pins.setColorAt(i, gold.clone().lerp(copper, Math.min(1, (x + y) / 1000)));
  });
  pins.instanceMatrix.needsUpdate = true;
  if (pins.instanceColor) pins.instanceColor.needsUpdate = true;
  ring.add(pins);

  const shape = new THREE.Shape();
  const vertices = [
    [279, 198],
    [226, 286],
    [265, 286],
    [259, 343],
    [316, 250],
    [275, 250],
  ];
  vertices.forEach(([x, y], i) =>
    i === 0 ? shape.moveTo(x - 270, 270 - y) : shape.lineTo(x - 270, 270 - y),
  );
  shape.closePath();
  const boltGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 18,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 2.5,
    bevelSegments: 3,
    steps: 1,
  });
  boltGeometry.center();
  const boltGold = new THREE.Color("#e9a22f");
  const ivory = new THREE.Color("#fffaf2");
  const boltMaterial = new THREE.MeshStandardMaterial({
    color: boltGold,
    metalness: 0.65,
    roughness: 0.25,
    transparent: true,
    emissive: ivory,
    emissiveIntensity: 0,
  });
  const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
  bolt.position.z = 25;
  bolt.rotation.y = -0.12;
  model.add(bolt);

  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 128;
  const ctx = glowCanvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,239,205,.65)");
  gradient.addColorStop(0.4, "rgba(255,189,104,.18)");
  gradient.addColorStop(1, "rgba(255,156,70,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Sprite(glowMaterial);
  glow.scale.set(220, 220, 1);
  glow.position.z = -15;
  model.add(glow);

  let frame = 0,
    lastTime = 0,
    speed = 0,
    phase = 0,
    intensity = 0;
  let hovered = host.matches(":hover"),
    focused = false,
    visible = true,
    disposed = false;
  let impulseUntil = 0,
    pointerX = 0,
    pointerY = 0;
  const hero = host.closest<HTMLElement>(".air-hero") ?? host;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const render = () => renderer.render(scene, camera);
  const tick = (time: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const active =
      !motion.matches && (hovered || focused || time < impulseUntil);
    const next = advanceReloadMotion(speed, ring.rotation.z, active, dt);
    speed = motion.matches ? 0 : next.speed;
    if (!motion.matches) ring.rotation.z = next.angle;
    phase += dt;
    intensity +=
      ((active ? 1 : Math.min(1, speed / 0.42)) - intensity) *
      (1 - Math.exp(-2 * dt));
    if (motion.matches) intensity = 0;
    const pulse =
      (0.5 - 0.5 * Math.cos((phase * Math.PI * 2) / 2.8)) * intensity;
    boltMaterial.color.copy(boltGold).lerp(ivory, pulse * 0.7);
    boltMaterial.emissiveIntensity = pulse * 0.75;
    boltMaterial.opacity = 1 - intensity * 0.18 + pulse * 0.18;
    glowMaterial.opacity = 0.16 + pulse * 0.5;
    const easing = 1 - Math.exp(-2.4 * dt);
    const targetY = -0.34 + (motion.matches ? 0 : pointerX * 0.2);
    const targetX = 0.24 - (motion.matches ? 0 : pointerY * 0.16);
    model.rotation.y += (targetY - model.rotation.y) * easing;
    model.rotation.x += (targetX - model.rotation.x) * easing;
    const tilting =
      Math.abs(targetY - model.rotation.y) +
        Math.abs(targetX - model.rotation.x) >
      0.0001;
    render();
    if (active || speed > 0.001 || intensity > 0.002 || tilting)
      frame = requestAnimationFrame(tick);
    else {
      speed = 0;
      intensity = 0;
    }
  };
  const wake = () => {
    if (!frame && !disposed && visible && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  const enter = (event: PointerEvent) => {
    if (event.pointerType !== "touch") {
      hovered = true;
      wake();
    }
  };
  const leave = () => {
    hovered = false;
    focused = host.matches(":focus-visible");
    wake();
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const bounds = host.getBoundingClientRect();
    pointerX = THREE.MathUtils.clamp(
      (event.clientX - bounds.left) / bounds.width - 0.5,
      -0.8,
      0.8,
    );
    pointerY = THREE.MathUtils.clamp(
      (event.clientY - bounds.top) / bounds.height - 0.5,
      -0.8,
      0.8,
    );
    wake();
  };
  const resetTilt = () => {
    pointerX = 0;
    pointerY = 0;
    wake();
  };
  const focus = () => {
    focused = host.matches(":focus-visible");
    wake();
  };
  const blur = () => {
    focused = false;
    wake();
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    speed = 0;
    intensity = 0;
    impulseUntil = 0;
  };
  const visibility = () => {
    if (document.hidden) stop();
    else wake();
  };
  const preference = () => {
    if (motion.matches) stop();
    wake();
  };
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else stop();
  });
  intersection.observe(host);
  host.addEventListener("pointerenter", enter);
  host.addEventListener("pointerleave", leave);
  hero.addEventListener("pointermove", move);
  hero.addEventListener("pointerleave", resetTilt);
  host.addEventListener("focus", focus);
  host.addEventListener("blur", blur);
  document.addEventListener("visibilitychange", visibility);
  motion.addEventListener("change", preference);
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  render();
  return {
    spin() {
      impulseUntil = performance.now() + 1800;
      wake();
    },
    dispose() {
      disposed = true;
      stop();
      resize.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", resetTilt);
      host.removeEventListener("focus", focus);
      host.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
      pinGeometry.dispose();
      pinMaterial.dispose();
      pins.dispose();
      boltGeometry.dispose();
      boltMaterial.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
