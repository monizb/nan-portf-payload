'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Configuration ───────────────────────────────────────────────
const SHAPE_GROUPS = [
  { type: 'sphere' as const, count: 5, color: '#D97757', roughness: 0.12, metalness: 0.5 },   // orange metal
  { type: 'sphere' as const, count: 5, color: '#E8915A', roughness: 0.45, metalness: 0.0 },   // orange plastic
  { type: 'sphere' as const, count: 5, color: '#F0EDE8', roughness: 0.95, metalness: 0.0 },   // white chalk
  { type: 'sphere' as const, count: 5, color: '#FAFAFA', roughness: 0.05, metalness: 0.15 },  // white shiny
  { type: 'hexagon' as const, count: 5, color: '#D97757', roughness: 0.8, metalness: 0.0 },   // black matte
  { type: 'hexagon' as const, count: 5, color: '#D97757', roughness: 0.05, metalness: 0.6 },  // black glossy
]
const TOTAL = SHAPE_GROUPS.reduce((sum, g) => sum + g.count, 0)
const GRAVITY_FACTOR = 38
const MOUSE_PUSH_FORCE = 0.15
const MOUSE_INFLUENCE = 0.12
const MOUSE_RADIUS = 0.03
const VELOCITY_DAMPING = 0.2
const INITIAL_SPREAD = 4.6

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
  const pz = (rand(index * 3 + 2) - 0.5) * 3.2

  const radius = 0.72 + rand(index * 7) * 0.55
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

function ShapeInstances() {
  const meshRefs = useRef<Map<number, THREE.InstancedMesh>>(new Map())
  const { camera } = useThree()
  const mouseNDC = useRef({ x: 0, y: 0 })
  const isFirstFrame = useRef(true)

  const hexGeom = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 6)
    g.computeVertexNormals()
    return g
  }, [])
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.5, 32, 20), [])

  const groupOffsets = useMemo(() => {
    const offsets: { start: number; count: number }[] = []
    let start = 0
    for (const g of SHAPE_GROUPS) {
      offsets.push({ start, count: g.count })
      start += g.count
    }
    return offsets
  }, [])

  const bodies = useMemo(() => {
    const arr: Body[] = []
    for (let i = 0; i < TOTAL; i++) {
      arr.push(createBody(i, 42))
    }
    return arr
  }, [])

  const materials = useMemo(() =>
    SHAPE_GROUPS.map(g => new THREE.MeshStandardMaterial({
      color: g.color,
      roughness: g.roughness,
      metalness: g.metalness,
    }))
  , [])

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

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)

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

    for (let gi = 0; gi < SHAPE_GROUPS.length; gi++) {
      const mesh = meshRefs.current.get(gi)
      if (!mesh) continue
      const { start, count } = groupOffsets[gi]
      for (let i = 0; i < count; i++) {
        const body = bodies[start + i]
        _dummy.position.copy(body.position)
        _dummy.quaternion.copy(body.quaternion)
        _dummy.scale.setScalar(body.radius)
        _dummy.updateMatrix()
        mesh.setMatrixAt(i, _dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      {SHAPE_GROUPS.map((group, gi) => (
        <instancedMesh
          key={gi}
          ref={(mesh: THREE.InstancedMesh | null) => {
            if (mesh) meshRefs.current.set(gi, mesh)
          }}
          args={[group.type === 'hexagon' ? hexGeom : sphereGeom, materials[gi], group.count]}
          frustumCulled={false}
        />
      ))}
    </>
  )
}

// ─── Scene with camera + lights ──────────────────────────────────
function Scene() {
  const startTime = useRef(0)
  useEffect(() => {
    startTime.current = Date.now()
  }, [])

  useFrame((state) => {
    if (!startTime.current) return
    const elapsed = (Date.now() - startTime.current) / 1000
    const targetZ = 14 - Math.min(elapsed / 2, 1) * 3.5
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.4} />
      <directionalLight position={[-5, -5, 3]} intensity={0.5} />
      <pointLight position={[0, 0, 8]} intensity={0.6} />
      <pointLight position={[-5, 3, 4]} intensity={0.3} />
      <ShapeInstances />
    </>
  )
}

// ─── Exported component ──────────────────────────────────────────
export default function CrossBalloons() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9', background: '#111' }}
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
        <Scene />
      </Canvas>
    </div>
  )
}
