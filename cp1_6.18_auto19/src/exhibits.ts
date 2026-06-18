import * as THREE from "three"

export interface ExhibitData {
  id: number
  title: string
  author: string
  size: string
  description: string
  image: string
  position: { wall: string; x: number; y: number; z: number }
}

export class ExhibitManager {
  private scene: THREE.Scene
  private exhibits: ExhibitData[] = []
  private exhibitMeshes: THREE.Mesh[] = []
  private onExhibitClick: (exhibit: ExhibitData) => void

  constructor(scene: THREE.Scene, onClick: (exhibit: ExhibitData) => void) {
    this.scene = scene
    this.onExhibitClick = onClick
  }

  async loadExhibits() {
    try {
      const res = await fetch("/api/exhibits")
      const data = await res.json()
      this.exhibits = Array.isArray(data) ? data : data.exhibits || []
      this.createExhibitMeshes()
    } catch (e) {
      console.error("Failed to load exhibits:", e)
      this.loadMockExhibits()
    }
  }

  private loadMockExhibits() {
    this.exhibits = [
      { id: 1, title: "晨曦中的森林", author: "李明远", size: "120cm × 80cm",
        description: "描绘清晨阳光穿过薄雾森林的景象。",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        position: { wall: "main-back", x: -3, y: 1.5, z: -9 } },
      { id: 2, title: "城市印象", author: "张雨桐", size: "100cm × 100cm",
        description: "以抽象色块表现城市的节奏与韵律。",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        position: { wall: "main-back", x: 3, y: 1.5, z: -9 } }
    ]
    this.createExhibitMeshes()
  }

  private createExhibitMeshes() {
    const textureLoader = new THREE.TextureLoader()
    this.exhibitMeshes = []
    
    for (const exhibit of this.exhibits) {
      const geometry = new THREE.PlaneGeometry(1.5, 2)
      const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geometry, material)
      
      mesh.position.set(exhibit.position.x, exhibit.position.y, exhibit.position.z)
      
      if (exhibit.position.wall.includes("left")) {
        mesh.rotation.y = Math.PI / 2
      } else if (exhibit.position.wall.includes("right")) {
        mesh.rotation.y = -Math.PI / 2
      }
      
      mesh.userData = { exhibit }
      this.exhibitMeshes.push(mesh)
      this.scene.add(mesh)
      
      textureLoader.load(exhibit.image, (texture) => {
        material.map = texture
        material.needsUpdate = true
      })
    }
  }

  getMeshes() { return this.exhibitMeshes }
  getExhibitCount() { return this.exhibits.length }

  getExhibitByMesh(mesh: THREE.Mesh) {
    return this.exhibits.find(e => e.id === mesh.userData.exhibit?.id)
  }
}
