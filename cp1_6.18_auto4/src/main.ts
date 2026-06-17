import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadMolecule } from './loadData';
import { createMolecule, centerMolecule, type MoleculeObjects } from './createMolecule';
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

  newMolecule.labels.forEach((label) => {
    label.visible = ui.isLabelVisible();
  });

  if (currentMolecule) {
    isTransitioning = true;
    const oldGroup = currentMolecule.group;
    oldGroup.userData.fadeProgress = 0;
    oldGroup.userData.fadingOut = true;

    newMolecule.group.userData.fadeProgress = 0;
    newMolecule.group.userData.fadingIn = true;
    newMolecule.group.scale.set(0.01, 0.01, 0.01);

    const fadeOld = () => {
      if (!oldGroup.userData.fadingOut) return;
      oldGroup.userData.fadeProgress += 0.06;
      if (oldGroup.userData.fadeProgress >= 1) {
        scene.remove(oldGroup);
        oldGroup.userData.fadingOut = false;
        isTransitioning = false;
      } else {
        const s = 1 - oldGroup.userData.fadeProgress;
        oldGroup.scale.set(s, s, s);
        requestAnimationFrame(fadeOld);
      }
    };

    const fadeNew = () => {
      if (!newMolecule.group.userData.fadingIn) return;
      newMolecule.group.userData.fadeProgress += 0.05;
      if (newMolecule.group.userData.fadeProgress >= 1) {
        newMolecule.group.scale.set(1, 1, 1);
        newMolecule.group.userData.fadingIn = false;
      } else {
        const s = newMolecule.group.userData.fadeProgress;
        const eased = 1 - Math.pow(1 - s, 3);
        newMolecule.group.scale.set(eased, eased, eased);
        requestAnimationFrame(fadeNew);
      }
    };

    scene.add(newMolecule.group);
    fadeOld();
    fadeNew();
  } else {
    scene.add(newMolecule.group);
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
