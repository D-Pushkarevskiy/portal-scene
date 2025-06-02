import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'

import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Texture
const bakedTexture = textureLoader.load('/baked.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

// Material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// Lights material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })
const portalLightMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
    uniforms: {
        uTime: { value: 0 }
    }
})

// Model
gltfLoader.load('/portal.glb', (glft) => {
    glft.scene.traverse((child) => {
        switch (child.name) {
            case 'poleLightA':
                child.material = poleLightMaterial
                break
            case 'poleLightB':
                child.material = poleLightMaterial
                break
            case 'portalLight':
                child.material = portalLightMaterial
                break
            default:
                child.material = bakedMaterial
                break
        }
    })

    scene.add(glft.scene)
})

// Fireflies
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.2
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

// Axe location fireflies
const firefliesAroundHandleGeometry = new THREE.BufferGeometry()
const firefliesAroundHandleCount = 10
const firefliesAroundHandlePositionArray = new Float32Array(firefliesAroundHandleCount * 3)
const firefliesAroundHandleScaleArray = new Float32Array(firefliesAroundHandleCount)

for (let i = 0; i < firefliesAroundHandleCount; i++) {
    firefliesAroundHandlePositionArray[i * 3 + 0] = (Math.random()) + 1
    firefliesAroundHandlePositionArray[i * 3 + 1] = 0
    firefliesAroundHandlePositionArray[i * 3 + 2] = (Math.random()) + 1

    firefliesAroundHandleScaleArray[i] = Math.random()
}

firefliesAroundHandleGeometry.setAttribute('position', new THREE.BufferAttribute(firefliesAroundHandlePositionArray, 3))
firefliesAroundHandleGeometry.setAttribute('aScale', new THREE.BufferAttribute(firefliesAroundHandleScaleArray, 1))

const firefliesMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uPixelRatio: {
            value: Math.min(window.devicePixelRatio, 2)
        }
    }
})
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
const firefliesAroundHandle = new THREE.Points(firefliesAroundHandleGeometry, firefliesMaterial)

scene.add(fireflies, firefliesAroundHandle)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update fireflies
    if (fireflies.uniforms && firefliesAroundHandle.uniforms) {
        fireflies.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
        firefliesAroundHandle.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2
camera.position.y = 4
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// Not going under horizon
controls.maxPolarAngle = Math.PI / 2 - 0.2;
controls.minDistance = 2
controls.maxDistance = 10

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#0e0e0e')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update fireflies
    firefliesMaterial.uniforms.uTime.value = elapsedTime

    // Update material
    portalLightMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()