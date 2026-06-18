import * as THREE from "three"

export class PlayerControls {
  private camera: THREE.PerspectiveCamera
  private domElement: HTMLElement
  private keys: Record<string, boolean> = {}
  private yaw = 0
  private pitch = 0
  private moveSpeed = 5
  private targetPosition = new THREE.Vector3(0, 1.6, 5)
  private collisionBoxes: THREE.Box3[] = []
  private bobTime = 0
  private isLocked = false

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera
    this.domElement = domElement
    this.setupKeyboard()
    this.setupPointerLock()
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  private setupPointerLock() {
    this.domElement.addEventListener("click", () => {
      this.domElement.requestPointerLock()
    })
    document.addEventListener("pointerlockchange", () => {
      this.isLocked = document.pointerLockElement === this.domElement
    })
    document.addEventListener("mousemove", (e) => {
      if (this.isLocked === false) return
      this.yaw -= e.movementX * 0.002
      this.pitch -= e.movementY * 0.002

  setCollisionBoxes(boxes: THREE.Box3[]) {
    this.collisionBoxes = boxes;
  }

  update(deltaTime: number) {
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const moveDir = new THREE.Vector3();
    if (this.keys['w']) moveDir.add(forward);
    if (this.keys['s']) moveDir.sub(forward);
    if (this.keys['d']) moveDir.add(right);
    if (this.keys['a']) moveDir.sub(right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      const speed = this.moveSpeed * deltaTime;
      const newPos = this.targetPosition.clone();
      newPos.add(moveDir.multiplyScalar(speed));

      const testBox = new THREE.Box3().setFromCenterAndSize(
        newPos,
        new THREE.Vector3(0.5, 1.6, 0.5)
      );

      let collides = false;
      for (const box of this.collisionBoxes) {
        if (testBox.intersectsBox(box)) {
          collides = true;
          break;
        }
      }

      if (collides === false) {
        this.targetPosition.copy(newPos);
      }
    }

    this.targetPosition.y = 1.6;

    const springFactor = 0.1;
    this.camera.position.lerp(this.targetPosition, springFactor);

    const lookDir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    const lookAt = new THREE.Vector3().copy(this.camera.position).add(lookDir);
    this.camera.lookAt(lookAt);

    const moving = moveDir.length() > 0;
    if (moving) {
      this.bobTime += deltaTime * 8;
    } else {
      this.bobTime *= 0.9;
    }

    const bobAmount = Math.sin(this.bobTime) * 0.05;
    this.camera.position.y += bobAmount;

    const rollAmount = Math.sin(this.bobTime * 0.5) * 0.01;
    this.camera.rotation.z = rollAmount;
  }
}
