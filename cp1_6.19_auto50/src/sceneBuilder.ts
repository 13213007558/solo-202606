import * as THREE from "three";
import { ProcessedPhotoData, BuildingRegion } from "./photoProcessor";

export class SceneBuilder {
    private scene: THREE.Scene;
    private buildingMeshes: THREE.Mesh[] = [];
    private groundMesh: THREE.Mesh | null = null;
    private buildingGroup: THREE.Group | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public build(data: ProcessedPhotoData): void {
        this.clear();
        this.buildingGroup = new THREE.Group();
        this.scene.add(this.buildingGroup);
        this.createGround(data);
        this.createBuildings(data);
        this.createSky(data);
    }

    private createGround(data: ProcessedPhotoData): void {
        const geometry = new THREE.PlaneGeometry(data.width * 1.5, data.height * 1.5);
        const material = new THREE.MeshStandardMaterial({
            color: this.parseColor(data.groundColor),
            roughness: 0.9,
            metalness: 0.1
        });
        this.groundMesh = new THREE.Mesh(geometry, material);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.position.set(data.width / 2, 0, data.height / 2);
        this.groundMesh.receiveShadow = true;
        this.buildingGroup?.add(this.groundMesh);
        const gridHelper = new THREE.GridHelper(Math.max(data.width, data.height) * 1.5, 20, 0x444444, 0x222222);
        gridHelper.position.set(data.width / 2, 0.01, data.height / 2);
        this.buildingGroup?.add(gridHelper);
    }

    private createBuildings(data: ProcessedPhotoData): void {
        data.buildings.forEach((building, index) => {
            const buildingMesh = this.createBuildingMesh(building, data);
            buildingMesh.userData = { buildingId: building.id };
            this.buildingMeshes.push(buildingMesh);
            this.buildingGroup?.add(buildingMesh);
        });
    }

    private createBuildingMesh(building: BuildingRegion, data: ProcessedPhotoData): THREE.Mesh {
        const baseHeight = 5 + building.depth * 25;
        const width = building.width * 0.9;
        const depth = building.height * 0.9;
        const geometry = new THREE.BoxGeometry(width, baseHeight, depth);
        const color = this.parseColor(building.avgColor);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.3,
            transparent: true,
            opacity: 1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(building.x + building.width / 2, baseHeight / 2, building.y + building.height / 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        mesh.add(edges);
        return mesh;
    }

    private createSky(data: ProcessedPhotoData): void {
        const skyColor = this.parseColor(data.skyColor);
        const fogColor = new THREE.Color(skyColor).lerp(new THREE.Color(0x1a1a2e), 0.3);
        this.scene.fog = new THREE.Fog(fogColor, 50, 150);
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 256);
            gradient.addColorStop(0, data.skyColor);
            gradient.addColorStop(1, "#1a1a2e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
        }
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
    }

    private parseColor(colorString: string): number {
        const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return (r << 16) | (g << 8) | b;
        }
        return 0x888888;
    }

    public setBuildingOpacity(opacity: number): void {
        this.buildingMeshes.forEach(mesh => {
            const material = mesh.material as THREE.MeshStandardMaterial;
            if (material) {
                material.opacity = opacity;
                material.transparent = opacity < 1;
            }
        });
    }

    public setGroundMaterial(materialType: string): void {
        if (!this.groundMesh) return;
        const material = this.groundMesh.material as THREE.MeshStandardMaterial;
        switch (materialType) {
            case "asphalt":
                material.color.setHex(0x333333);
                material.roughness = 0.95;
                material.metalness = 0.05;
                break;
            case "grass":
                material.color.setHex(0x4a7c23);
                material.roughness = 0.8;
                material.metalness = 0.0;
                break;
            case "water":
                material.color.setHex(0x1a5276);
                material.roughness = 0.1;
                material.metalness = 0.8;
                break;
        }
    }

    public getBuildingMeshes(): THREE.Mesh[] {
        return this.buildingMeshes;
    }

    public clear(): void {
        if (this.buildingGroup) {
            this.scene.remove(this.buildingGroup);
            this.buildingGroup.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.buildingGroup = null;
        }
        this.buildingMeshes = [];
        this.groundMesh = null;
    }
}
