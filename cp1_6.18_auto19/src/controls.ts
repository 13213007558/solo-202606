import * as THREE from "three"

export class PlayerControls {
  private camera: THREE.PerspectiveCamera
  private keys: Record<string, boolean> = {}
  private velocity = new THREE.Vector3()
  private yaw = 0
  private pitch = 0
  private isPointerLocked = false
  private collisionBoxes: THREE.Box3[] = []
  private bobOffset = 0
  private bobSpeed = 0
  private moveSpeed = 5
  private lookSensitivity = 0.002
  private targetPosition = new THREE.Vector3(0, 1.6, 5)
  private targetLookAt = new THREE.Vector3(0, 1.6, 0)

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
    this.setupKeyboard()
    this.setupPointerLock()
  }

  private setupKeyboard() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true
    })
    document.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false
    })
  }

  private setupPointerLock() {
    document.addEventListener("click", () => {
      document.body.requestPointerLock()
    })
    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = document.pointerLockElement === document.body
    })
    document.addEventListener("mousemove", (e) => {
      if (!this.isPointerLocked) return
      this.yaw -= e.movementX * this.lookSensitivity
      this.pitch -= e.movementY * this.lookSensitivity
      this.pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.pitch))
    })
  }

  setCollisionBoxes(boxes: THREE.Box3[]) {
    this.collisionBoxes = boxes
  }

  update(deltaTime: number) {
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw))
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
    
    const moveDir = new THREE.Vector3()
    if (this.keys["w"]) moveDir.add(forward)
    if (this.keys["s"]) moveDir.sub(forward)
    if (this.keys["d"]) moveDir.add(right)
    if (this.keys["a"]) moveDir.sub(right)
    
    if (moveDir.length() > 0) {
      moveDir.normalize()
      const speed = this.moveSpeed * deltaTime
      const newPos = this.targetPosition.clone()
      newPos.add(moveDir.multiplyScalar(speed))
      
      const testBox = new THREE.Box3().setFromCenterAndSize(
        newPos, new THREE.Vector3(0.5, 1.6, 0.5)
      )
      
      let collides = false
      for (const box of this.collisionBoxes) {
        if (testBox.intersectsBox(box)) {
          collides = true
          break
        }
      }
      
      if (!collides) {
        this.targetPosition.copy(newPos)
      }
    }
    
    this.targetPosition.y = 1.6
    
    const springFactor = 0.1
    this.camera.position.lerp(this.targetPosition, springFactor)
    
    const lookDir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    )
    const lookAt = new THREE.Vector3().copy(this.camera.position).add(lookDir)
    this.camera.lookAt(lookAt)
    
    const moving = moveDir.length() > 0
    if (moving) {
      this.bobTime += deltaTime * 8
    } else {
      this.bobTime *= 0.9
    }
    
    const bobAmount = Math.sin(this.bobTime) * 0.05
    this.camera.position.y += bobAmount
    
    const rollAmount = Math.sin(this.bobTime * 0.5) * 0.01
    this.camera.rotation.z = rollAmount
  }
}
