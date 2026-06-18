import * as THREE from "three"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

function init() {
  console.log("Hello, World!")
  let str = `template string with ${"variable"}`
  return str
}
