import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadMolecule } from './loadData';
import { createMolecule, centerMolecule, fadeInMolecule, fadeOutMolecule, setMoleculeOpacity, type MoleculeObjects } from './createMolecule';
import { UIController } from './ui';

const container = document.getElementById('canvas-container')!;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(3, 2.5, 4);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.8;
controls.zoomSpeed = 1.2;
controls.minDistance = 1;
controls.maxDistance = 20;

const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight1.position.set(5, 8, 6);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0x8899bb, 0.6);
directionalLight2.position.set(-4, -2, -5);
scene.add(directionalLight2);

const hemisphereLight = new THREE.HemisphereLight(0x4466aa, 0x111122, 0.4);
scene.add(hemisphereLight);

const ui = new UIController();

let currentMolecule: MoleculeObjects | null = null;
let isTransitioning = false;

function setMolecule(id: string): void {
  const data = loadMolecule(id);
  if (!data) return;

  const newMolecule = createMolecule(data);
  centerMolecule(newMolecule);
  setMoleculeOpacity(newMolecule, 0);

  newMolecule.labels.forEach((label) => {
    label.visible = ui.isLabelVisible();
  });

  if (currentMolecule) {
    isTransitioning = true;
    const oldMolecule = currentMolecule;

    scene.add(newMolecule.group);

    fadeOutMolecule(oldMolecule, 250).then(() => {
      scene.remove(oldMolecule.group);
    });

    fadeInMolecule(newMolecule, 500).then(() => {
      isTransitioning = false;
    });
  } else {
    scene.add(newMolecule.group);
    setMoleculeOpacity(newMolecule, 1);
  }

  currentMolecule = newMolecule;
  ui.hideAtomInfo();

  adjustCameraForMolecule(newMolecule);
}

function adjustCameraForMolecule(mol: MoleculeObjects): void {
  const box = new THREE.Box3().setFromObject(mol.group);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 2.5;
  camera.position.set(distance * 0.7, distance * 0.5, distance * 0.8);
  controls.target.set(0, 0, 0);
  controls.update();
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredAtom: THREE.Mesh | null = null;

function onMouseMove(event: MouseEvent): void {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (hoveredAtom) {
    const mat = hoveredAtom.material as THREE.MeshPhongMaterial;
    mat.emissive.setHex(0x000000);
    hoveredAtom = null;
  }

  if (!currentMolecule) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(currentMolecule.atomMeshes);

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    hoveredAtom = mesh;
    const mat = mesh.material as THREE.MeshPhongMaterial;
    mat.emissive.setHex(0x222244);
    renderer.domElement.style.cursor = 'pointer';
  } else {
    renderer.domElement.style.cursor = 'default';
    ui.hideAtomInfo();
  }
}

function onClick(event: MouseEvent): void {
  if (!currentMolecule) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(currentMolecule.atomMeshes);

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    const ud = mesh.userData;
    ui.showAtomInfo(ud.element, ud.atomIndex, ud.x, ud.y, ud.z, event.clientX, event.clientY);
  } else {
    ui.hideAtomInfo();
  }
}

renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('click', onClick);

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

ui.setMoleculeChangeCallback((id: string) => {
  setMolecule(id);
});

ui.setLabelToggleCallback((visible: boolean) => {
  if (currentMolecule) {
    currentMolecule.labels.forEach((label) => {
      label.visible = visible;
    });
  }
});

setMolecule(ui.getCurrentMoleculeId());

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
