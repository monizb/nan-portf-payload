'use client'

import { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Configuration ───────────────────────────────────────────────
const NUM_HEXAGONS = 7
const NUM_SPHERES = 7
const TOTAL = NUM_HEXAGONS + NUM_SPHERES
const GRAVITY_FACTOR = 35
const MOUSE_PUSH_FORCE = 0.15
const MOUSE_INFLUENCE = 0.12
const MOUSE_RADIUS = 0.03
const VELOCITY_DAMPING = 0.2
const INITIAL_SPREAD = 8
const COLOR_PALETTE = [
  '#D97757', // terracotta
  '#1a2ffb', // blue
  '#bb2bff', // purple
  '#1eff5d', // green
  '#cfff0f', // lime
  '#ff383c', // red
]

// ─── Physics body ────────────────────────────────────────────────
interface Body {
  position: THREE.Vector3
  velocity: THREE.Vector3
  position0: THREE.Vector3
  velocity0: THREE.Vector3
  radius: number
  mass: number
  friction: number
  restitution: number
  frictionTot: number
  quaternion: THREE.Quaternion
  inertia: number
}

function createBody(index: number, seed: number): Body {
  const rand = (i: number) => {
    const x = Math.sin((seed + i) * 9301 + 49297) % 1
    return x - Math.floor(x)
  }
  const px = (rand(index * 3) - 0.5) * INITIAL_SPREAD
  const py = (rand(index * 3 + 1) - 0.5) * INITIAL_SPREAD
  const pz = (rand(index * 3 + 2) - 0.5) * 4

  const radius = 0.6 + rand(index * 7) * 0.6
  const density = 0.8 + rand(index * 11) * 0.4
  const volume = Math.PI * radius * 1.333
  const mass = volume * radius * radius * density

  return {
    position: new THREE.Vector3(px, py, pz),
    velocity: new THREE.Vector3(-px * 2, -py * 2, -pz * 2),
    position0: new THREE.Vector3(px, py, pz),
    velocity0: new THREE.Vector3(-px * 2, -py * 2, -pz * 2),
    radius,
    mass,
    friction: 0.5,
    restitution: 0.5,
    frictionTot: 0,
    quaternion: new THREE.Quaternion(),
    inertia: mass * radius * radius * 0.4,
  }
}

// ─── Physics simulation ──────────────────────────────────────────
const _mouse = new THREE.Vector3()
const _mousePrev = new THREE.Vector3()
const _mouseBA = new THREE.Vector3()
const _mousePushForce = new THREE.Vector3()
const _p1 = new THREE.Vector3()
const _v0 = new THREE.Vector3()
const _v1 = new THREE.Vector3()
const _normal = new THREE.Vector3()
const _vel = new THREE.Vector3()
const _pos = new THREE.Vector3()
const _q = new THREE.Quaternion()

function simulatePhysics(
  bodies: Body[],
  dt: number,
  mouseNDC: { x: number; y: number },
  camera: THREE.Camera,
) {
  // Unproject mouse to 3D position on z=0 plane
  _p1.set(mouseNDC.x, mouseNDC.y, 0.5)
  _p1.unproject(camera)
  _p1.sub(camera.position).normalize()
  const t = -camera.position.z / _p1.z
  _p1.multiplyScalar(t)
  _mouse.copy(camera.position).add(_p1)

  _mousePushForce.copy(_mouse).sub(_mousePrev).multiplyScalar(MOUSE_PUSH_FORCE / Math.max(dt, 0.001))
  _mouseBA.copy(_mouse).sub(camera.position)
  const mouseBALenSq = _mouseBA.lengthSq()
  _mousePrev.copy(_mouse)

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]

    // Central gravity
    const gf = _v0.copy(body.position).negate().multiplyScalar(GRAVITY_FACTOR)
    const ga = gf.multiplyScalar(1 / body.mass / (1 + body.frictionTot))
    body.velocity.addScaledVector(ga, dt)
    body.frictionTot *= 0.5

    _vel.copy(body.velocity)
    _pos.copy(body.position)

    // Body-to-body collisions
    for (let j = i + 1; j < bodies.length; j++) {
      const other = bodies[j]
      _v1.copy(other.velocity)
      _p1.copy(other.position)
      _normal.copy(_pos).sub(_p1)

      const dist = _normal.length()
      const minDist = body.radius + other.radius

      if (dist < minDist) {
        const fric = Math.sqrt(body.friction * other.friction)
        body.frictionTot += fric
        other.frictionTot += fric

        _normal.normalize()
        _normal.multiplyScalar(0.5 * (dist - minDist))
        _pos.sub(_normal)
        _p1.add(_normal)
        _normal.normalize()

        const v1n = _vel.dot(_normal)
        const v2n = _v1.dot(_normal)
        const m1 = body.mass
        const m2 = other.mass
        const cr1 = body.restitution
        const cr2 = other.restitution

        const newV1 = (m1 * v1n + m2 * v2n - m2 * (v1n - v2n) * cr1) / (m1 + m2)
        const newV2 = (m1 * v1n + m2 * v2n - m1 * (v2n - v1n) * cr2) / (m1 + m2)

        _vel.addScaledVector(_normal, (newV1 - v1n) / (1 + fric))
        _v1.addScaledVector(_normal, (newV2 - v2n) / (1 + fric))

        other.position.copy(_p1)
        other.velocity.copy(_v1)
      }
    }

    // Mouse push
    _v0.copy(_pos).sub(camera.position)
    const closestParam = _v0.dot(_mouseBA) / mouseBALenSq
    const mouseDist = _v0.sub(_v1.copy(_mouseBA).multiplyScalar(closestParam)).length() - body.radius - MOUSE_RADIUS
    if (mouseDist < 0) {
      _v0.copy(_pos).sub(camera.position).cross(_mouseBA).normalize()
      _v1.copy(_mouseBA).cross(_v0).normalize()
      _pos.sub(_v1.multiplyScalar(MOUSE_INFLUENCE * mouseDist))
      _v1.multiplyScalar(-MOUSE_PUSH_FORCE / Math.max(dt, 0.001))
      _vel.add(_v1)
      _vel.add(_mousePushForce)
    }

    // Orbital rotation
    const posLen = _pos.length()
    if (posLen > 0) {
      _v0.set(1, 1, 1).normalize()
      const factor = (1 - Math.abs(_v0.dot(_v1.copy(_pos).normalize()))) *
        dt * Math.min(posLen / 2, 1) * 0.5 * (i % 2 * 2 - 1)
      _q.setFromAxisAngle(_v0, factor)
      _v1.copy(_pos).applyQuaternion(_q).sub(_v0.copy(_pos))
      _vel.add(_v1)
    }

    // Angular velocity → quaternion
    _v0.copy(_pos).cross(_vel)
    const angVelMag = _v0.length() / body.inertia
    if (angVelMag > 0) {
      _v0.normalize()
      _q.setFromAxisAngle(_v0, angVelMag * dt)
      body.quaternion.premultiply(_q)
    }

    body.position.copy(_pos)
    body.velocity.copy(_vel)

    // Integrate
    body.position.addScaledVector(body.velocity, dt)
    body.velocity.multiplyScalar(Math.pow(VELOCITY_DAMPING, dt))
  }
}

// ─── Instanced 3D shapes ─────────────────────────────────────────
const _dummy = new THREE.Object3D()
const _color = new THREE.Color()

function ShapeInstances({ colorIndex }: { colorIndex: number }) {
  const hexMeshRef = useRef<THREE.InstancedMesh>(null)
  const sphereMeshRef = useRef<THREE.InstancedMesh>(null)
  const { camera } = useThree()
  const mouseNDC = useRef({ x: 0, y: 0 })
  const isFirstFrame = useRef(true)

  // 3D geometries: hexagonal prism + sphere
  const hexGeom = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 6)
    g.computeVertexNormals()
    return g
  }, [])
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.5, 24, 16), [])

  const bodies = useMemo(() => {
    const arr: Body[] = []
    for (let i = 0; i < TOTAL; i++) {
      arr.push(createBody(i, 42))
    }
    return arr
  }, [])

  // Track mouse position in NDC
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = (e.target as HTMLElement)?.closest?.('canvas')?.getBoundingClientRect()
      if (!rect) return
      mouseNDC.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseNDC.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Update colors when colorIndex changes
  useEffect(() => {
    if (!hexMeshRef.current || !sphereMeshRef.current) return
    for (let i = 0; i < NUM_HEXAGONS; i++) {
      const offset = (i + colorIndex) % COLOR_PALETTE.length
      _color.set(COLOR_PALETTE[offset])
      hexMeshRef.current.setColorAt(i, _color)
    }
    for (let i = 0; i < NUM_SPHERES; i++) {
      const offset = (NUM_HEXAGONS + i + colorIndex) % COLOR_PALETTE.length
      _color.set(COLOR_PALETTE[offset])
      sphereMeshRef.current.setColorAt(i, _color)
    }
    if (hexMeshRef.current.instanceColor) hexMeshRef.current.instanceColor.needsUpdate = true
    if (sphereMeshRef.current.instanceColor) sphereMeshRef.current.instanceColor.needsUpdate = true
  }, [colorIndex])

  // Initialize instance colors on mount
  useEffect(() => {
    if (!hexMeshRef.current || !sphereMeshRef.current) return
    for (let i = 0; i < NUM_HEXAGONS; i++) {
      _color.set(COLOR_PALETTE[i % COLOR_PALETTE.length])
      hexMeshRef.current.setColorAt(i, _color)
    }
    for (let i = 0; i < NUM_SPHERES; i++) {
      _color.set(COLOR_PALETTE[(NUM_HEXAGONS + i) % COLOR_PALETTE.length])
      sphereMeshRef.current.setColorAt(i, _color)
    }
    if (hexMeshRef.current.instanceColor) hexMeshRef.current.instanceColor.needsUpdate = true
    if (sphereMeshRef.current.instanceColor) sphereMeshRef.current.instanceColor.needsUpdate = true
  }, [])

  useFrame((_, delta) => {
    if (!hexMeshRef.current || !sphereMeshRef.current) return
    const dt = Math.min(delta, 1 / 30)

    // Initialize _mousePrev on first frame
    if (isFirstFrame.current) {
      _p1.set(mouseNDC.current.x, mouseNDC.current.y, 0.5)
      _p1.unproject(camera)
      _p1.sub(camera.position).normalize()
      const t = -camera.position.z / _p1.z
      _p1.multiplyScalar(t)
      _mousePrev.copy(camera.position).add(_p1)
      isFirstFrame.current = false
    }

    simulatePhysics(bodies, dt, mouseNDC.current, camera)

    // Update hexagon transforms (first NUM_HEXAGONS bodies)
    for (let i = 0; i < NUM_HEXAGONS; i++) {
      const body = bodies[i]
      _dummy.position.copy(body.position)
      _dummy.quaternion.copy(body.quaternion)
      _dummy.scale.setScalar(body.radius)
      _dummy.updateMatrix()
      hexMeshRef.current.setMatrixAt(i, _dummy.matrix)
    }
    hexMeshRef.current.instanceMatrix.needsUpdate = true

    // Update sphere transforms (remaining bodies)
    for (let i = 0; i < NUM_SPHERES; i++) {
      const body = bodies[NUM_HEXAGONS + i]
      _dummy.position.copy(body.position)
      _dummy.quaternion.copy(body.quaternion)
      _dummy.scale.setScalar(body.radius)
      _dummy.updateMatrix()
      sphereMeshRef.current.setMatrixAt(i, _dummy.matrix)
    }
    sphereMeshRef.current.instanceMatrix.needsUpdate = true
  })

  const hexMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.25,
    metalness: 0.15,
  }), [])

  const sphereMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.1,
    metalness: 0.3,
  }), [])

  return (
    <>
      <instancedMesh ref={hexMeshRef} args={[hexGeom, hexMat, NUM_HEXAGONS]} frustumCulled={false} />
      <instancedMesh ref={sphereMeshRef} args={[sphereGeom, sphereMat, NUM_SPHERES]} frustumCulled={false} />
    </>
  )
}

// ─── Scene with camera + lights ──────────────────────────────────
function Scene({ colorIndex }: { colorIndex: number }) {
  // Subtle camera dolly-in on mount
  const startTime = useRef(0)
  useEffect(() => {
    startTime.current = Date.now()
  }, [])

  useFrame((state) => {
    if (!startTime.current) return
    const elapsed = (Date.now() - startTime.current) / 1000
    const targetZ = 14 - Math.min(elapsed / 2, 1) * 2.5
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, 3]} intensity={0.4} />
      <pointLight position={[0, 0, 8]} intensity={0.8} />
      <ShapeInstances colorIndex={colorIndex} />
    </>
  )
}

// ─── Exported component ──────────────────────────────────────────
export default function CrossBalloons() {
  const [colorIndex, setColorIndex] = useState(0)

  const handleClick = useCallback(() => {
    setColorIndex((prev) => (prev + 1) % COLOR_PALETTE.length)
  }, [])

  return (
    <div
      className="w-full rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{ aspectRatio: '16/9', background: '#111' }}
      onClick={handleClick}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        camera={{ fov: 25, near: 0.1, far: 100 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#111']} />
        <Scene colorIndex={colorIndex} />
      </Canvas>
    </div>
  )
}
