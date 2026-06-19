import * as THREE from "three";
import { PhotoProcessor, ProcessedPhotoData } from "./photoProcessor";
import { SceneBuilder } from "./sceneBuilder";
import { CameraController } from "./cameraController";
import { UIController } from "./uiController";

class App {
    private scene: THREE.Scene | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private renderer: THREE.WebGLRenderer | null = null;
    private photoProcessor: PhotoProcessor;
    private sceneBuilder: SceneBuilder | null = null;
    private cameraController: CameraController | null = null;
    private uiController: UIController;
    private processedData: ProcessedPhotoData | null = null;
    private animationFrameId: number | null = null;

    constructor() {
        this.photoProcessor = new PhotoProcessor();
        this.uiController = new UIController({
            onFileSelect: this.handleFileSelect.bind(this),
            onViewChange: this.handleViewChange.bind(this),
            onOpacityChange: this.handleOpacityChange.bind(this),
            onMaterialChange: this.handleMaterialChange.bind(this),
            onAmbientChange: this.handleAmbientChange.bind(this),
            onResetView: this.handleResetView.bind(this),
            onBuildingClick: this.handleBuildingClick.bind(this)
        });
        this.initThreeJS();
        this.animate();
    }

    private initThreeJS(): void {
        const canvas = document.getElementById("three-canvas") as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Canvas element not found");
        }
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 20);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.cameraController = new CameraController(this.camera, this.renderer.domElement);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        window.addEventListener("resize", this.handleResize.bind(this));
    }

    private async handleFileSelect(file: File): Promise<void> {
        this.uiController.showLoading(true);
        this.uiController.showUploadOverlay(false);
        try {
            this.processedData = await this.photoProcessor.process(file);
            if (this.scene) {
                if (this.sceneBuilder) {
                    this.sceneBuilder.clear();
                }
                this.sceneBuilder = new SceneBuilder(this.scene);
                this.sceneBuilder.build(this.processedData);
                this.cameraController?.setTarget(new THREE.Vector3(0, 5, 0));
                this.handleViewChange("birdseye");
                this.uiController.showControls(true);
            }
        } catch (error) {
            console.error("Processing error:", error);
            alert(error instanceof Error ? error.message : "处理失败，请重试");
            this.uiController.showUploadOverlay(true);
        } finally {
            this.uiController.showLoading(false);
        }
    }

    private handleViewChange(view: string): void {
        if (!this.cameraController || !this.processedData) return;
        const centerX = this.processedData.width / 2;
        const centerZ = this.processedData.height / 2;
        switch (view) {
            case "birdseye":
                this.cameraController.animateTo(new THREE.Vector3(centerX, 60, centerZ + 50), new THREE.Vector3(centerX, 0, centerZ));
                break;
            case "street":
                this.cameraController.animateTo(new THREE.Vector3(centerX, 3, centerZ + 30), new THREE.Vector3(centerX, 5, centerZ));
                break;
            case "panoramic":
                this.cameraController.startOrbit(new THREE.Vector3(centerX, 8, centerZ), 40);
                break;
        }
        this.uiController.setActiveView(view);
    }

    private handleOpacityChange(value: number): void {
        this.sceneBuilder?.setBuildingOpacity(value);
        this.uiController.updateOpacityValue(value);
    }

    private handleMaterialChange(material: string): void {
        this.sceneBuilder?.setGroundMaterial(material);
        this.uiController.setActiveMaterial(material);
    }

    private handleAmbientChange(value: number): void {
        if (this.scene) {
            const ambientLight = this.scene.children.find(child => child instanceof THREE.AmbientLight) as THREE.AmbientLight;
            if (ambientLight) {
                ambientLight.intensity = value;
            }
        }
        this.uiController.updateAmbientValue(value);
    }

    private handleResetView(): void {
        this.handleViewChange("birdseye");
    }

    private handleBuildingClick(buildingId: string): void {
        if (!this.processedData) return;
        const building = this.processedData.buildings.find(b => b.id === buildingId);
        if (building) {
            this.uiController.showInfoPanel(building);
        }
    }

    private handleResize(): void {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate(): void {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        this.cameraController?.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    public destroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        window.removeEventListener("resize", this.handleResize.bind(this));
        this.renderer?.dispose();
        this.sceneBuilder?.clear();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new App();
});
