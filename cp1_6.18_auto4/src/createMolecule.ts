import * as THREE from 'three';
import type { AtomData, BondData, MoleculeData } from './loadData';

const CPK_COLORS: Record<string, number> = {
  H: 0xffffff,
  C: 0x909090,
  N: 0x3050f8,
  O: 0xff0d0d,
  F: 0x90e050,
  P: 0xff8000,
  S: 0xffff30,
  Cl: 0x1ff01f,
  Br: 0xa62929,
  I: 0x940094,
};

const ATOM_RADII: Record<string, number> = {
  H: 0.31,
  C: 0.77,
  N: 0.75,
  O: 0.73,
  F: 0.72,
  P: 1.07,
  S: 1.02,
  Cl: 0.99,
  Br: 1.14,
  I: 1.33,
};

const SCALE = 0.5;
const BOND_RADIUS = 0.08;
const LABEL_OFFSET_Y = 0.6;

export interface MoleculeObjects {
  group: THREE.Group;
  atomMeshes: THREE.Mesh[];
  labels: THREE.Sprite[];
}

function getColor(element: string): number {
  return CPK_COLORS[element] ?? 0xff1493;
}

function getRadius(element: string): number {
  return (ATOM_RADII[element] ?? 0.5) * SCALE;
}

function createAtomMesh(atom: AtomData): THREE.Mesh {
  const radius = getRadius(atom.element);
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const color = getColor(atom.element);
  const material = new THREE.MeshPhongMaterial({
    color,
    shininess: 60,
    specular: 0x444444,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(atom.x, atom.y, atom.z);
  mesh.userData = { atomIndex: atom.index, element: atom.element, x: atom.x, y: atom.y, z: atom.z };
  return mesh;
}

function createBondMesh(from: THREE.Vector3, to: THREE.Vector3): THREE.Mesh {
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, length, 12, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0x667799,
    shininess: 30,
    specular: 0x222222,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  mesh.position.copy(midpoint);

  const axis = new THREE.Vector3(0, 1, 0);
  const dir = direction.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir);
  mesh.quaternion.copy(quaternion);

  return mesh;
}

function createLabelSprite(text: string, position: THREE.Vector3): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 48px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 3;
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    sizeAttenuation: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.6, 0.3, 1);
  sprite.position.set(position.x, position.y + getRadius(text.charAt(0)) + LABEL_OFFSET_Y * SCALE, position.z);
  return sprite;
}

export function createMolecule(data: MoleculeData): MoleculeObjects {
  const group = new THREE.Group();
  const atomMeshes: THREE.Mesh[] = [];
  const labels: THREE.Sprite[] = [];

  const positions: Map<number, THREE.Vector3> = new Map();

  for (const atom of data.atoms) {
    const mesh = createAtomMesh(atom);
    group.add(mesh);
    atomMeshes.push(mesh);
    positions.set(atom.index, mesh.position.clone());

    const label = createLabelSprite(atom.element, mesh.position);
    group.add(label);
    labels.push(label);
  }

  for (const bond of data.bonds) {
    const fromPos = positions.get(bond.from);
    const toPos = positions.get(bond.to);
    if (fromPos && toPos) {
      const bondMesh = createBondMesh(fromPos, toPos);
      group.add(bondMesh);
    }
  }

  return { group, atomMeshes, labels };
}

export function centerMolecule(objects: MoleculeObjects): void {
  const box = new THREE.Box3().setFromObject(objects.group);
  const center = box.getCenter(new THREE.Vector3());
  objects.group.position.sub(center);
}
