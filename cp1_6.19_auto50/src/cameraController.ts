import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private isAnimating: boolean = false;
    private animationStart: THREE.Vector3;
    private animationEnd: THREE.Vector3;
    private targetStart: THREE.Vector3;
    private targetEnd: THREE.Vector3;
    private animationProgress: number = 0;
    private animationDuration: number = 1000;
    private isOrbiting: boolean = false;
    private orbitCenter: THREE.Vector3;
    private orbitRadius: number;
    private orbitAngle: number = 0;
    private orbitHeight: number;

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.animationStart = new THREE.Vector3();
        this.animationEnd = new THREE.Vector3();
        this.targetStart = new THREE.Vector3();
        this.targetEnd = new THREE.Vector3();
        this.orbitCenter = new THREE.Vector3();
        this.orbitRadius = 20;
        this.orbitHeight = 8;
    }

    public animateTo(position: THREE.Vector3, target: THREE.Vector3): void {
        this.isOrbiting = false;
        this.isAnimating = true;
        this.animationProgress = 0;
        this.animationStart.copy(this.camera.position);
        this.animationEnd.copy(position);
        this.targetStart.copy(this.controls.target);
        this.targetEnd.copy(target);
    }

    public startOrbit(center: THREE.Vector3, radius: number): void {
        this.isAnimating = false;
        this.isOrbiting = true;
        this.orbitCenter.copy(center);
        this.orbitRadius = radius;
        this.orbitHeight = center.y;
        this.orbitAngle = 0;
        this.controls.target.copy(center);
    }

    public stopOrbit(): void {
        this.isOrbiting = false;
    }

    public setTarget(target: THREE.Vector3): void {
        this.controls.target.copy(target);
    }

    public update(): void {
        if (this.isAnimating) {
            this.animationProgress += 16;
            const t = Math.min(this.animationProgress / this.animationDuration, 1);
            const easeT = this.easeInOutCubic(t);
            this.camera.position.lerpVectors(this.animationStart, this.animationEnd, easeT);
            this.controls.target.lerpVectors(this.targetStart, this.targetEnd, easeT);
            if (t >= 1) {
                this.isAnimating = false;
            }
        }
        if (this.isOrbiting) {
            this.orbitAngle += 0.005;
            const x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            const z = this.orbitCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius;
            this.camera.position.set(x, this.orbitHeight, z);
            this.camera.lookAt(this.orbitCenter);
        }
        this.controls.update();
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public getControls(): OrbitControls {
        return this.controls;
    }

    public setOrbitHeight(height: number): void {
        this.orbitHeight = height;
    }
}
