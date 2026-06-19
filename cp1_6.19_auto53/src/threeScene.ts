import * as THREE from 'three';
import { MoleculeData, AtomData, ELEMENT_DATA, computeForceDirectedPositions } from './parser';

export type DisplayMode = 'ball-stick' | 'space-fill' | 'wireframe';

interface IntroAnimation {
  active: boolean;
  startTime: number;
  duration: number;
}

interface ModeAnimation {
  active: boolean;
  startTime: number;
  duration: number;
  fromMode: DisplayMode;
  toMode: DisplayMode;
}

interface ResetAnimation {
  active: boolean;
  startTime: number;
  duration: number;
  startSpherical: { radius: number; theta: number; phi: number };
}

export class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private moleculeGroup: THREE.Group;
  private atomMeshes: Map<number, THREE.Mesh>;
  private bondMeshes: THREE.Mesh[];
  private highlightedAtom: THREE.Mesh | null;
  private infoPanel: HTMLElement;
  private currentMode: DisplayMode;
  private isDragging: boolean;
  private previousMouse: { x: number; y: number };
  private spherical: { radius: number; theta: number; phi: number };
  private initialSpherical: { radius: number; theta: number; phi: number };
  private animationFrameId: number | null;
  private introAnimation: IntroAnimation;
  private atomOriginalScales: Map<number, THREE.Vector3>;
  private modeAnimation: ModeAnimation;
  private resetAnimation: ResetAnimation;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.scene = new THREE.Scene();
    this.scene.background = null;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.spherical = { radius: 8, theta: Math.PI / 4, phi: Math.PI / 3 };
    this.initialSpherical = { ...this.spherical };
    this.updateCameraPositionFromSpherical();
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-5, -5, -5);
    this.scene.add(dirLight2);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.moleculeGroup = new THREE.Group();
    this.scene.add(this.moleculeGroup);
    this.atomMeshes = new Map();
    this.bondMeshes = [];
    this.highlightedAtom = null;
    this.currentMode = 'ball-stick';
    this.isDragging = false;
    this.previousMouse = { x: 0, y: 0 };
    this.animationFrameId = null;
    this.introAnimation = { active: false, startTime: 0, duration: 800 };
    this.atomOriginalScales = new Map();
    this.modeAnimation = { active: false, startTime: 0, duration: 300, fromMode: 'ball-stick', toMode: 'ball-stick' };
    this.resetAnimation = { active: false, startTime: 0, duration: 600, startSpherical: { radius: 0, theta: 0, phi: 0 } };

    this.infoPanel = document.getElementById('atom-info-panel') as HTMLElement;

    this.setupEventListeners();
    this.animate();
  }

  private setupEventListeners(): void {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.previousMouse.x;
        const dy = e.clientY - this.previousMouse.y;
        this.spherical.theta -= dx * 0.01;
        this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi - dy * 0.01));
        this.updateCameraPositionFromSpherical();
        this.previousMouse = { x: e.clientX, y: e.clientY };
      }

      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkAtomHover(e.clientX, e.clientY);
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(2, Math.min(30, this.spherical.radius + e.deltaY * 0.01));
      this.updateCameraPositionFromSpherical();
    }, { passive: false });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkAtomClick();
    });

    window.addEventListener('resize', () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private checkAtomHover(screenX: number, screenY: number): void {
    if (this.atomMeshes.size === 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.atomMeshes.values());
    const intersects = this.raycaster.intersectObjects(meshes);

    if (this.highlightedAtom) {
      const material = this.highlightedAtom.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(0x000000);
      this.highlightedAtom = null;
      this.hideAtomInfo();
    }

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(0x333333);
      this.highlightedAtom = mesh;
      const atomData = mesh.userData.atomData as AtomData;
      this.showAtomInfo(atomData, screenX, screenY);
    }
  }

  private checkAtomClick(): void {
    if (this.atomMeshes.size === 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.atomMeshes.values());
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const atomData = mesh.userData.atomData as AtomData;
      console.log('Atom clicked:', atomData);
    }
  }

  public loadMolecule(data: MoleculeData): void {
    while (this.moleculeGroup.children.length > 0) {
      const child = this.moleculeGroup.children[0];
      this.moleculeGroup.remove(child);
    }
    this.atomMeshes.clear();
    this.bondMeshes = [];
    this.atomOriginalScales.clear();

    const positions = computeForceDirectedPositions(data);

    data.atoms.forEach((atom, index) => {
      const elementInfo = ELEMENT_DATA[atom.symbol];
      const baseRadius = this.getAtomRadiusForMode(atom, this.currentMode);

      const geometry = new THREE.SphereGeometry(baseRadius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: elementInfo.cpkColor,
        roughness: 0.3,
        metalness: 0.1,
        wireframe: this.currentMode === 'wireframe',
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2]
      );
      mesh.userData.atomData = atom;
      mesh.userData.atomIndex = index;
      mesh.userData.baseRadius = baseRadius;
      mesh.scale.set(0.001, 0.001, 0.001);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.atomMeshes.set(index, mesh);
      this.atomOriginalScales.set(index, new THREE.Vector3(1, 1, 1));
      this.moleculeGroup.add(mesh);
    });

    data.bonds.forEach((bond) => {
      const fromPos = new THREE.Vector3(
        positions[bond.from * 3],
        positions[bond.from * 3 + 1],
        positions[bond.from * 3 + 2]
      );
      const toPos = new THREE.Vector3(
        positions[bond.to * 3],
        positions[bond.to * 3 + 1],
        positions[bond.to * 3 + 2]
      );
      const bondMesh = this.createBondMesh(bond.from, bond.to, fromPos, toPos);
      this.bondMeshes.push(bondMesh);
      this.moleculeGroup.add(bondMesh);
    });

    const bbox = new THREE.Box3().setFromObject(this.moleculeGroup);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    this.spherical.radius = maxDim * 2.5 + 3;
    this.initialSpherical = { ...this.spherical };
    this.updateCameraPositionFromSpherical();

    this.introAnimation = {
      active: true,
      startTime: performance.now(),
      duration: 800,
    };
  }

  private getAtomRadiusForMode(atom: AtomData, mode: DisplayMode): number {
    switch (mode) {
      case 'space-fill':
        return atom.radius * 1.2;
      case 'wireframe':
      case 'ball-stick':
      default:
        return atom.radius * 0.6;
    }
  }

  private getBondOpacityForMode(mode: DisplayMode): number {
    switch (mode) {
      case 'space-fill':
        return 0.0;
      case 'wireframe':
        return 1.0;
      case 'ball-stick':
      default:
        return 0.9;
    }
  }

  public setDisplayMode(mode: DisplayMode): void {
    if (mode === this.currentMode) return;

    this.modeAnimation = {
      active: true,
      startTime: performance.now(),
      duration: 300,
      fromMode: this.currentMode,
      toMode: mode,
    };
    this.currentMode = mode;
  }

  public resetCamera(): void {
    this.resetAnimation = {
      active: true,
      startTime: performance.now(),
      duration: 600,
      startSpherical: { ...this.spherical },
    };
  }

  public takeScreenshot(): void {
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `molecule-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }

  public getStats(): { atomCount: number; bondCount: number } {
    return {
      atomCount: this.atomMeshes.size,
      bondCount: this.bondMeshes.length,
    };
  }

  private updateCameraPositionFromSpherical(): void {
    const { radius, theta, phi } = this.spherical;
    this.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    this.camera.position.y = radius * Math.cos(phi);
    this.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    this.camera.lookAt(0, 0, 0);
  }

  private createBondMesh(
    from: number,
    to: number,
    fromPos: THREE.Vector3,
    toPos: THREE.Vector3
  ): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(toPos, fromPos);
    const length = direction.length();
    const midpoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);

    const geometry = new THREE.CylinderGeometry(0.08, 0.08, length, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: this.getBondOpacityForMode(this.currentMode),
      depthWrite: this.getBondOpacityForMode(this.currentMode) > 0.5,
      wireframe: this.currentMode === 'wireframe',
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(midpoint);

    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      up,
      direction.clone().normalize()
    );
    mesh.quaternion.copy(quaternion);

    mesh.userData.bondData = { from, to };
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  private showAtomInfo(atomData: AtomData, screenX: number, screenY: number): void {
    const elementInfo = ELEMENT_DATA[atomData.symbol];
    this.infoPanel.innerHTML = `
      <div class="symbol">${atomData.symbol}</div>
      <div class="atom-info-line">Atomic Number: <span>${atomData.atomicNumber}</span></div>
      <div class="atom-info-line">Bonds: <span>${atomData.bonds.length}</span></div>
      <div class="atom-info-line">Max Bonds: <span>${elementInfo.maxBonds}</span></div>
    `;
    const rect = this.container.getBoundingClientRect();
    let left = screenX - rect.left + 15;
    let top = screenY - rect.top + 15;
    if (left + 160 > rect.width) left = screenX - rect.left - 175;
    if (top + 100 > rect.height) top = screenY - rect.top - 110;
    this.infoPanel.style.left = `${left}px`;
    this.infoPanel.style.top = `${top}px`;
    this.infoPanel.classList.add('visible');
  }

  private hideAtomInfo(): void {
    this.infoPanel.classList.remove('visible');
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const now = performance.now();

    if (this.introAnimation.active) {
      const elapsed = now - this.introAnimation.startTime;
      const t = Math.min(1, elapsed / this.introAnimation.duration);
      const eased = this.easeOutCubic(t);
      this.atomMeshes.forEach((mesh) => {
        mesh.scale.setScalar(eased);
      });
      if (t >= 1) {
        this.introAnimation.active = false;
      }
    }

    if (this.modeAnimation.active) {
      const elapsed = now - this.modeAnimation.startTime;
      const t = Math.min(1, elapsed / this.modeAnimation.duration);
      const eased = this.easeOutCubic(t);

      const toWireframe = this.modeAnimation.toMode === 'wireframe';
      const fromWireframe = this.modeAnimation.fromMode === 'wireframe';

      this.atomMeshes.forEach((mesh) => {
        const atomData = mesh.userData.atomData as AtomData;
        const fromRadius = this.getAtomRadiusForMode(atomData, this.modeAnimation.fromMode);
        const toRadius = this.getAtomRadiusForMode(atomData, this.modeAnimation.toMode);
        const currentRadius = fromRadius + (toRadius - fromRadius) * eased;

        mesh.geometry.dispose();
        mesh.geometry = new THREE.SphereGeometry(currentRadius, 32, 32);

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (toWireframe && !fromWireframe) {
          mat.wireframe = eased > 0.5;
        } else if (!toWireframe && fromWireframe) {
          mat.wireframe = eased < 0.5;
        }
      });

      const fromOpacity = this.getBondOpacityForMode(this.modeAnimation.fromMode);
      const toOpacity = this.getBondOpacityForMode(this.modeAnimation.toMode);
      const currentOpacity = fromOpacity + (toOpacity - fromOpacity) * eased;
      this.bondMeshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = currentOpacity;
        mat.depthWrite = currentOpacity > 0.5;
        if (toWireframe && !fromWireframe) {
          mat.wireframe = eased > 0.5;
        } else if (!toWireframe && fromWireframe) {
          mat.wireframe = eased < 0.5;
        }
      });

      if (t >= 1) {
        this.modeAnimation.active = false;
        this.atomMeshes.forEach((mesh) => {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.wireframe = toWireframe;
        });
        this.bondMeshes.forEach((mesh) => {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.wireframe = toWireframe;
        });
      }
    }

    if (this.resetAnimation.active) {
      const elapsed = now - this.resetAnimation.startTime;
      const t = Math.min(1, elapsed / this.resetAnimation.duration);
      const eased = this.easeOutCubic(t);

      const start = this.resetAnimation.startSpherical;
      const end = this.initialSpherical;
      this.spherical.radius = start.radius + (end.radius - start.radius) * eased;
      this.spherical.theta = start.theta + (end.theta - start.theta) * eased;
      this.spherical.phi = start.phi + (end.phi - start.phi) * eased;
      this.updateCameraPositionFromSpherical();

      if (t >= 1) {
        this.resetAnimation.active = false;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.atomMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.bondMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.renderer.dispose();
  }
}
