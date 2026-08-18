import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import './style.css';

// =========================
// CẤU HÌNH DỄ CHỈNH
// =========================
const MESSAGE = 'I LOVE YOU';
const SPAWN_EVERY_MS = 130;
const SPAWN_BATCH = 2;
const INITIAL_TEXTS = 90;
const MAX_FALLING_OBJECTS = 150;
const HEART_CHANCE = 0.18;
const SCREEN_SAFE_WIDTH_FACTOR = 0.72;
const FALL_MIN = 2.0;
const FALL_MAX = 4.8;
const RAIN_TOP = 30;
const RAIN_BOTTOM = -18;
const MUSIC_START_SECONDS = 138;
const MUSIC_END_SECONDS = null;
const MUSIC_VOLUME = 0.45;

const canvas = document.querySelector('#love-canvas');
const intro = document.querySelector('.intro');
const music = document.querySelector('#bg-music');
const musicToggle = document.querySelector('.music-toggle');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020716);
scene.fog = new THREE.FogExp2(0x03112c, 0.023);

const camera = new THREE.PerspectiveCamera(
  58,
  window.innerWidth / window.innerHeight,
  0.1,
  180
);
camera.position.set(0, 4.5, 20);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.42,
  0.32,
  0.24
);
composer.addPass(bloomPass);

// Cho phép xoay / zoom không gian 3D
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 48;
controls.target.set(0, 2, 0);

// Ánh sáng
scene.add(new THREE.HemisphereLight(0x8ed8ff, 0x020b24, 1.45));

const keyLight = new THREE.PointLight(0x1f8fff, 52, 42, 2);
keyLight.position.set(4, 12, 8);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x005dff, 46, 38, 2);
rimLight.position.set(-8, 5, -10);
scene.add(rimLight);

// "Mặt sàn" rất nhẹ để tăng cảm giác chiều sâu
const grid = new THREE.GridHelper(42, 42, 0x247cff, 0x09215c);
grid.position.y = -10;
grid.material.transparent = true;
grid.material.opacity = 0.14;
scene.add(grid);

// Nền sao 3D
function createStars({
  count = 1800,
  color = 0x8bd8ff,
  size = 0.08,
  opacity = 0.78,
  yMin = -20,
  yMax = 45,
  zMin = -55,
  zMax = 20
} = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = THREE.MathUtils.randFloatSpread(90);
    positions[i3 + 1] = THREE.MathUtils.randFloat(yMin, yMax);
    positions[i3 + 2] = THREE.MathUtils.randFloat(zMin, zMax);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

const stars = createStars({
  count: 2600,
  color: 0xb8e8ff,
  size: 0.115,
  opacity: 0.95
});

const farStars = createStars({
  count: 1200,
  color: 0x2f7dff,
  size: 0.16,
  opacity: 0.42,
  yMin: -18,
  yMax: 52,
  zMin: -75,
  zMax: -12
});

// Tạo geometry chữ 3D một lần rồi dùng lại
const font = new FontLoader().parse(fontJson);
const baseGeometry = new TextGeometry(MESSAGE, {
  font,
  size: 1.0,
  depth: 0.18,
  curveSegments: 5,
  bevelEnabled: true,
  bevelThickness: 0.035,
  bevelSize: 0.025,
  bevelOffset: 0,
  bevelSegments: 2
});
baseGeometry.computeBoundingBox();
baseGeometry.center();

const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0.35);
heartShape.bezierCurveTo(0, 0.6, -0.45, 0.78, -0.72, 0.45);
heartShape.bezierCurveTo(-1.02, 0.08, -0.78, -0.42, 0, -0.88);
heartShape.bezierCurveTo(0.78, -0.42, 1.02, 0.08, 0.72, 0.45);
heartShape.bezierCurveTo(0.45, 0.78, 0, 0.6, 0, 0.35);

const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
  depth: 0.16,
  bevelEnabled: true,
  bevelThickness: 0.035,
  bevelSize: 0.025,
  bevelSegments: 2
});
heartGeometry.center();

const palette = [
  0x0f7bff,
  0x1d9bff,
  0x2f6fff,
  0x004dff,
  0x5bbcff
];

const fallingObjects = [];
let lastSpawn = 0;
let musicStarted = false;

if (music) {
  music.volume = MUSIC_VOLUME;
}

async function playMusic() {
  if (!music) return;

  try {
    if (music.currentTime < MUSIC_START_SECONDS) {
      music.currentTime = MUSIC_START_SECONDS;
    }

    await music.play();
    musicStarted = true;
    musicToggle?.classList.add('playing');
    musicToggle?.setAttribute('aria-label', 'Tắt nhạc');
  } catch (error) {
    musicStarted = false;
    musicToggle?.classList.remove('playing');
    console.warn('Music cannot start until the audio file exists and the user interacts with the page.', error);
  }
}

function pauseMusic() {
  if (!music) return;

  music.pause();
  musicStarted = false;
  musicToggle?.classList.remove('playing');
  musicToggle?.setAttribute('aria-label', 'Bật nhạc');
}

musicToggle?.addEventListener('click', (event) => {
  event.stopPropagation();

  if (music?.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
});

music?.addEventListener('loadedmetadata', () => {
  if (Number.isFinite(MUSIC_START_SECONDS) && MUSIC_START_SECONDS > 0) {
    music.currentTime = MUSIC_START_SECONDS;
  }
});

music?.addEventListener('timeupdate', () => {
  if (
    Number.isFinite(MUSIC_END_SECONDS) &&
    music.currentTime >= MUSIC_END_SECONDS
  ) {
    music.currentTime = MUSIC_START_SECONDS;
    if (!music.paused) {
      music.play();
    }
  }
});

window.addEventListener('pointerdown', () => {
  if (!musicStarted && music?.paused) {
    playMusic();
  }
}, { once: true });

playMusic();
window.addEventListener('load', playMusic, { once: true });

function makeTextMaterial() {
  const color = new THREE.Color(
    palette[Math.floor(Math.random() * palette.length)]
  );

  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.04,
    transparent: true,
    opacity: THREE.MathUtils.randFloat(0.9, 1)
  });
}

function makeHeartMaterial() {
  const color = new THREE.Color(
    palette[Math.floor(Math.random() * palette.length)]
  );

  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.05,
    roughness: 0.16,
    metalness: 0.04,
    transparent: true,
    opacity: THREE.MathUtils.randFloat(0.84, 0.96)
  });
}

function getRainBounds(depth) {
  const aspect = window.innerWidth / window.innerHeight;
  const width = THREE.MathUtils.mapLinear(depth, -30, 12, 34, 18) * Math.max(1, aspect * 0.78) * SCREEN_SAFE_WIDTH_FACTOR;
  const height = RAIN_TOP - RAIN_BOTTOM;

  return { width, height };
}

function placeFallingObject(mesh, scaleMin, scaleMax) {
  if (fallingObjects.length >= MAX_FALLING_OBJECTS) return false;

  const depth = THREE.MathUtils.randFloat(-30, 12);
  const { width } = getRainBounds(depth);

  mesh.position.set(
    THREE.MathUtils.randFloatSpread(width),
    THREE.MathUtils.randFloat(18, RAIN_TOP),
    depth
  );

  const scale = THREE.MathUtils.randFloat(scaleMin, scaleMax);
  mesh.scale.setScalar(scale);

  mesh.rotation.set(
    0,
    0,
    0
  );

  mesh.userData = {
    speed: THREE.MathUtils.randFloat(FALL_MIN, FALL_MAX),
    spinX: 0,
    spinY: 0,
    drift: 0,
    phase: Math.random() * Math.PI * 2
  };

  scene.add(mesh);
  fallingObjects.push(mesh);
  return true;
}

function spawnLoveText() {
  const mesh = new THREE.Mesh(baseGeometry, makeTextMaterial());
  if (!placeFallingObject(mesh, 0.34, 0.96)) {
    mesh.material.dispose();
  }
}

function spawnHeart() {
  const mesh = new THREE.Mesh(heartGeometry, makeHeartMaterial());
  if (!placeFallingObject(mesh, 0.7, 1.65)) {
    mesh.material.dispose();
  }
}

function spawnFallingObject() {
  if (Math.random() < HEART_CHANCE) {
    spawnHeart();
  } else {
    spawnLoveText();
  }
}

function removeFallingObject(index) {
  const mesh = fallingObjects[index];
  scene.remove(mesh);
  mesh.material.dispose();
  fallingObjects.splice(index, 1);
}

// Tạo sẵn vài chữ để vừa mở đã có hiệu ứng
for (let i = 0; i < INITIAL_TEXTS; i++) {
  spawnFallingObject();
  const mesh = fallingObjects[fallingObjects.length - 1];
  const { height } = getRainBounds(mesh.position.z);
  mesh.position.y = THREE.MathUtils.randFloat(RAIN_BOTTOM, RAIN_BOTTOM + height);
}

const clock = new THREE.Clock();

function animate(time) {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.035);
  const elapsed = clock.elapsedTime;

  if (time - lastSpawn >= SPAWN_EVERY_MS) {
    for (let i = 0; i < SPAWN_BATCH; i++) {
      spawnFallingObject();
    }
    lastSpawn = time;
  }

  for (let i = fallingObjects.length - 1; i >= 0; i--) {
    const mesh = fallingObjects[i];
    const data = mesh.userData;

    mesh.position.y -= data.speed * delta;
    mesh.position.x += Math.sin(elapsed * 0.9 + data.phase) * data.drift * delta;
    mesh.rotation.x += data.spinX * delta;
    mesh.rotation.y += data.spinY * delta;

    if (mesh.position.y < RAIN_BOTTOM) {
      removeFallingObject(i);
    }
  }

  stars.rotation.y += 0.006 * delta;
  stars.rotation.x = Math.sin(elapsed * 0.08) * 0.02;
  farStars.rotation.y -= 0.003 * delta;
  farStars.rotation.x = Math.sin(elapsed * 0.06) * 0.015;

  controls.update();
  composer.render();
}

animate(0);

// Làm chữ intro mờ đi để không che hiệu ứng
setTimeout(() => {
  intro?.classList.add('fade');
}, 2400);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
