import * as THREE from "three"
import { createGalleryScene } from "./scene"
import { PlayerControls } from "./controls"
import { ExhibitManager } from "./exhibits"
import { UIManager } from "./ui"

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: PlayerControls
let exhibitManager: ExhibitManager
let uiManager: UIManager
let sceneUpdate: (delta: number) => void
let clock: THREE.Clock
let isMobile = false
let targetFPS = 60
let lastFrameTime = 0
let frameInterval = 1000 / targetFPS

function init() {
  isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  targetFPS = isMobile ? 30 : 60
  frameInterval = 1000 / targetFPS

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f0e6)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 1.6, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const galleryData = createGalleryScene(scene);
  sceneUpdate = galleryData.update;

  controls = new PlayerControls(camera, renderer.domElement);
  controls.setCollisionBoxes(galleryData.collisionBoxes);

  uiManager = new UIManager();

  exhibitManager = new ExhibitManager(scene, (exhibit) => {
    uiManager.showExhibitCard(exhibit);
  });
  exhibitManager.loadExhibits().then(() => {
    uiManager.updateExhibitCount(exhibitManager.getExhibitCount());
  });

  loadVisitorCount();
  setInterval(loadVisitorCount, 30000);

  clock = new THREE.Clock();

  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onCanvasClick);

  animate();
}

function loadVisitorCount() {
  fetch('/api/visitors')
    .then((res) => res.json())
    .then((data) => {
      uiManager.updateVisitorCount(data.count);
    })
    .catch(() => {
      uiManager.updateVisitorCount(12);
    });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onCanvasClick() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(0, 0);
  raycaster.setFromCamera(mouse, camera);
  const meshes = exhibitManager.getMeshes();
  const intersects = raycaster.intersectObjects(meshes);
  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    const exhibit = exhibitManager.getExhibitByMesh(mesh);
    if (exhibit) {
      uiManager.showExhibitCard(exhibit);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const delta = now - lastFrameTime;
  if (delta < frameInterval) return;
  lastFrameTime = now - (delta % frameInterval);

  const deltaTime = clock.getDelta();
  controls.update(deltaTime);
  sceneUpdate(deltaTime);
  renderer.render(scene, camera);
}

init();
