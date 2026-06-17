import * as THREE from "three";

export interface GalleryScene {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  floor: THREE.Mesh;
  turntable: THREE.Group;
  turntableLightRing: THREE.Group;
  turntableRingLights: THREE.PointLight[];
  collisionBoxes: { minX: number; maxX: number; minZ: number; maxZ: number }[];
  exhibitSlots: ExhibitSlot[];
  update: (delta: number, elapsed: number, cameraMoving: boolean) => void;
}

export interface ExhibitSlot {
  id: string;
  wall: "north" | "south" | "east" | "west" | "left-wing" | "right-wing";
  index: number;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  spotlight: THREE.SpotLight | null;
  spotlightBaseIntensity: number;
  spotlightPeriod: number;
  spotlightPhase: number;
}

export const GALLERY = {
  main: { w: 28, d: 22, h: 6 },
  leftWing: { w: 14, d: 16, h: 6 },
  rightWing: { w: 14, d: 16, h: 6 },
  wall: 0.4
};

const COLORS = {
  wall: 0xf5f0e8,
  wallAccent: 0xe8dcc8,
  floor: 0x8b6914,
  ceiling: 0xfff2d8,
  frame: 0x3a2a1a,
  ambience: 0xffe4b5,
  spot: 0xffc880
};

export function createGallery(container: HTMLElement): GalleryScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1510);
  scene.fog = new THREE.Fog(0x1a1510, 35, 90);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  const mobile = isMobile();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    62, container.clientWidth / container.clientHeight, 0.05, 200
  );
  camera.position.set(0, 1.68, 14);

  const collisions: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  const slots: ExhibitSlot[] = [];

  const floor = buildWallsFloorCeiling(scene, collisions, slots);
  const turntable = buildTurntable(scene);
  const { ringGroup, ringLights } = buildTurntableLightRing(scene);
  addAmbientLights(scene);
  addSkirtings(scene);
  addPillars(scene);

  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  function update(delta: number, elapsed: number, cameraMoving: boolean): void {
    turntable.rotation.y += delta * 0.15;
    ringGroup.rotation.y += delta * 0.18;

    for (const s of slots) {
      if (s.spotlight) {
        const t = (elapsed / s.spotlightPeriod) * Math.PI * 2 + s.spotlightPhase;
        const breath = Math.sin(t);
        s.spotlight.intensity = s.spotlightBaseIntensity * (1 + breath * 0.09);
      }
    }

    ringLights.forEach((l, i) => {
      const t = elapsed * 1.2 + i * 0.78;
      l.intensity = 0.45 * (1 + Math.sin(t) * 0.08);
    });

    const mat = floor.material as THREE.MeshStandardMaterial;
    if (cameraMoving) {
      mat.roughness = THREE.MathUtils.lerp(mat.roughness, 0.62, 0.08);
      mat.metalness = THREE.MathUtils.lerp(mat.metalness, 0.14, 0.08);
    } else {
      mat.roughness = THREE.MathUtils.lerp(mat.roughness, 0.45, 0.025);
      mat.metalness = THREE.MathUtils.lerp(mat.metalness, 0.08, 0.025);
    }
  }

  return {
    scene, renderer, camera, floor,
    turntable,
    turntableLightRing: ringGroup,
    turntableRingLights: ringLights,
    collisionBoxes: collisions,
    exhibitSlots: slots,
    update
  };
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function buildWallsFloorCeiling(
  scene: THREE.Scene,
  collisions: { minX: number; maxX: number; minZ: number; maxZ: number }[],
  slots: ExhibitSlot[]
): THREE.Mesh {
  const { main, leftWing, rightWing, wall } = GALLERY;
  const hw = main.w / 2;
  const hd = main.d / 2;

  const totalW = main.w + leftWing.w + rightWing.w;
  const totalD = main.d + leftWing.d;

  const floorTex = makeFloorTexture();
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(14, 10);
  floorTex.anisotropy = 8;

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.45,
    metalness: 0.08,
    color: 0xd4b48a
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(totalW, totalD), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);
