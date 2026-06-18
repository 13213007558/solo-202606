import * as THREE from "three"

export function createGalleryScene(scene: THREE.Scene) {
  const floorGeometry = new THREE.PlaneGeometry(30, 20)
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    roughness: 0.8,
    metalness: 0.1
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f0e6,
    roughness: 0.9
  })
  
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMaterial)
  backWall.position.set(0, 3, -10)
  backWall.receiveShadow = true
  scene.add(backWall)
  
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMaterial)
  leftWall.position.set(-10, 3, 0)
  leftWall.rotation.y = Math.PI / 2
  leftWall.receiveShadow = true
  scene.add(leftWall)
  
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMaterial)
  rightWall.position.set(10, 3, 0)
  rightWall.rotation.y = -Math.PI / 2
  rightWall.receiveShadow = true
  scene.add(rightWall)
  
  const leftWingWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMaterial)
  leftWingWall.position.set(-15, 3, 0)
  leftWingWall.rotation.y = Math.PI / 2
  leftWingWall.receiveShadow = true
  scene.add(leftWingWall)
  
  const rightWingWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMaterial)
  rightWingWall.position.set(15, 3, 0)
  rightWingWall.rotation.y = -Math.PI / 2
  rightWingWall.receiveShadow = true
  scene.add(rightWingWall)
  
  const pedestalGeo = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32)
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.6 })
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat)
  pedestal.position.set(0, 0.15, -3)
  pedestal.castShadow = true
  scene.add(pedestal)
  
  const displayGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32)
  const displayMat = new THREE.MeshStandardMaterial({ color: 0x6B5344, roughness: 0.5 })
  const display = new THREE.Mesh(displayGeo, displayMat)
  display.position.set(0, 0.35, -3)
  display.castShadow = true
  scene.add(display)
  
  const spotlight = new THREE.SpotLight(0xffeedd, 1, 15, Math.PI / 6, 0.5)
  spotlight.position.set(0, 5, -3)
  spotlight.target = display
  spotlight.castShadow = true
  scene.add(spotlight)
  
  const ambientLight = new THREE.AmbientLight(0xfff0e0, 0.6)
  scene.add(ambientLight)
  
  const wallLights = []
  const lightPositions = [
    [-3, 5, -9.5], [3, 5, -9.5],
    [-9.5, 5, -3], [-9.5, 5, 3],
    [9.5, 5, -3], [9.5, 5, 3],
    [-14.5, 5, -3], [-14.5, 5, 3],
    [14.5, 5, -3], [14.5, 5, 3]
  ]
  
  for (const pos of lightPositions) {
    const light = new THREE.SpotLight(0xffe4b5, 0.8, 8, Math.PI / 4, 0.4)
    light.position.set(pos[0], pos[1], pos[2])
    light.target.position.set(pos[0], 1.5, pos[2] + (pos[0] > 9 || pos[0] < -9 ? 0 : 0.1))
    scene.add(light)
    scene.add(light.target)
    wallLights.push(light)
  }
  
  const ceilingGeo = new THREE.PlaneGeometry(30, 20)
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6, side: THREE.DoubleSide })
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = 6
  scene.add(ceiling)
  
  const collisionBoxes: THREE.Box3[] = []
  
  const walls = [
    { pos: [0, 3, -10], size: [20, 6, 0.3] },
    { pos: [0, 3, 10], size: [20, 6, 0.3] },
    { pos: [-10, 3, 0], size: [0.3, 6, 20] },
    { pos: [10, 3, 0], size: [0.3, 6, 20] },
    { pos: [-15, 3, 0], size: [0.3, 6, 10] },
    { pos: [15, 3, 0], size: [0.3, 6, 10] },
  ]
  
  for (const w of walls) {
    collisionBoxes.push(new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(w.pos[0], w.pos[1], w.pos[2]),
      new THREE.Vector3(w.size[0], w.size[1], w.size[2])
    ))
  }
  
  const pedestalGroup = new THREE.Group()
  pedestalGroup.add(pedestal)
  pedestalGroup.add(display)
  pedestalGroup.position.set(0, 0, -3)
  scene.add(pedestalGroup)
  
  function update(deltaTime: number) {
    pedestalGroup.rotation.y += deltaTime * 0.3
  }
  
  return { scene, collisionBoxes, update, display }
}

export { createGalleryScene }
