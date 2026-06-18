import * as THREE from "three"

export function createGalleryScene(scene: THREE.Scene) {
  const floorGeo = new THREE.PlaneGeometry(30, 20)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    roughness: 0.7,
    metalness: 0.1
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e6,
    roughness: 0.9
  })

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat)
  backWall.position.set(0, 3, -10)
  backWall.receiveShadow = true
  scene.add(backWall)

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat)
  leftWall.position.set(-10, 3, 0)
  leftWall.rotation.y = Math.PI / 2
  leftWall.receiveShadow = true
  scene.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat)
  rightWall.position.set(10, 3, 0)
  rightWall.rotation.y = -Math.PI / 2
  rightWall.receiveShadow = true
  scene.add(rightWall)

  const leftWingWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat);
  leftWingWall.position.set(-15, 3, 0);
  leftWingWall.rotation.y = Math.PI / 2;
  leftWingWall.receiveShadow = true;
  scene.add(leftWingWall);

  const rightWingWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat);
  rightWingWall.position.set(15, 3, 0);
  rightWingWall.rotation.y = -Math.PI / 2;
  rightWingWall.receiveShadow = true;
  scene.add(rightWingWall);

  const ceilingGeo = new THREE.PlaneGeometry(30, 20);
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6, side: THREE.DoubleSide });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 6;
  scene.add(ceiling);

  const pedestalGroup = new THREE.Group();

  const pedestalGeo = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.6 });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = 0.15;
  pedestal.castShadow = true;
  pedestalGroup.add(pedestal);

  const displayGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32);
  const displayMat = new THREE.MeshStandardMaterial({ color: 0x6B5344, roughness: 0.5 });
  const display = new THREE.Mesh(displayGeo, displayMat);
  display.position.y = 0.35;
  display.castShadow = true;
  pedestalGroup.add(display);

  pedestalGroup.position.set(0, 0, -3);
  scene.add(pedestalGroup);

  const collisionBoxes: THREE.Box3[] = [];

  const walls = [
    { pos: [0, 3, -10], size: [20, 6, 0.3] },
    { pos: [0, 3, 10], size: [20, 6, 0.3] },
    { pos: [-10, 3, 0], size: [0.3, 6, 20] },
    { pos: [10, 3, 0], size: [0.3, 6, 20] },
    { pos: [-15, 3, 0], size: [0.3, 6, 10] },
    { pos: [15, 3, 0], size: [0.3, 6, 10] }
  ];

  for (const w of walls) {
    collisionBoxes.push(new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(w.pos[0], w.pos[1], w.pos[2]),
      new THREE.Vector3(w.size[0], w.size[1], w.size[2])
    ));
  }

  function update(deltaTime: number) {
    pedestalGroup.rotation.y += deltaTime * 0.3;
  }

  return { scene, collisionBoxes, update, display };
}

export { createGalleryScene };
