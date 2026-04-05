'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

const BALL_COLOR = '#F0EDE8'
const ICOSA_GREY = '#9A9B9F'

// ─── Configuration ───────────────────────────────────────────────
const SHAPE_GROUPS = [
  { type: 'sphere' as const, count: 4, color: BALL_COLOR, roughness: 0.93, metalness: 0 },
  { type: 'sphere' as const, count: 4, color: BALL_COLOR, roughness: 0.38, metalness: 0.42 },
  { type: 'icosahedron' as const, count: 14, color: ICOSA_GREY, roughness: 0.88, metalness: 0 },
  { type: 'icosahedron' as const, count: 14, color: ICOSA_GREY, roughness: 0.42, metalness: 0.38 },
]
const TOTAL = SHAPE_GROUPS.reduce((sum, g) => sum + g.count, 0)
const BODY_RADIUS = 0.52
const GRAVITY_FACTOR = 26
const MOUSE_PUSH_FORCE = 0.42
const MOUSE_INFLUENCE = 0.32
const MOUSE_RADIUS = 0.09
const VELOCITY_DAMPING = 0.2
const INITIAL_SPREAD = 8.2
const COLLISION_SLOP = 0.015
const COLLISION_PUSH = 1.05
const MIN_COLLISION_DISTANCE = 0.0001
const OVERLAP_RELAX_ITERS = 4

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
  const pz = (rand(index * 3 + 2) - 0.5) * (INITIAL_SPREAD * 0.42)

  const radius = BODY_RADIUS
  const density = 0.85 + rand(index * 11) * 0.2
  const volume = Math.PI * radius * 1.333
  const mass = volume * radius * radius * density

  return {
    position: new THREE.Vector3(px, py, pz),
    velocity: new THREE.Vector3(-px * 2, -py * 2, -pz * 2),
    position0: new THREE.Vector3(px, py, pz),
    velocity0: new THREE.Vector3(-px * 2, -py * 2, -pz * 2),
    radius,
    mass,
    friction: 0.65,
    restitution: 0.22,
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
const _sepN = new THREE.Vector3()

function relaxOverlaps(bodies: Body[]) {
  for (let iter = 0; iter < OVERLAP_RELAX_ITERS; iter++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]
        const b = bodies[j]
        _sepN.copy(a.position).sub(b.position)
        const dist = _sepN.length()
        const minDist = a.radius + b.radius
        if (dist >= minDist) continue
        if (dist > MIN_COLLISION_DISTANCE) {
          _sepN.multiplyScalar(1 / dist)
        } else {
          _sepN.set(Math.cos(i * 2.1 + j), Math.sin(i + j * 1.7), 0.35).normalize()
        }
        const overlap = minDist - dist
        const push = overlap * 0.55
        const inv = 1 / (a.mass + b.mass)
        a.position.addScaledVector(_sepN, push * b.mass * inv)
        b.position.addScaledVector(_sepN, -push * a.mass * inv)
      }
    }
  }
}

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

        if (dist > MIN_COLLISION_DISTANCE) {
          _normal.multiplyScalar(1 / dist)
        } else {
          _normal.set(Math.cos(i + j), Math.sin(i * 1.7 + j), 0.25).normalize()
        }

        const overlap = minDist - dist
        const separation = Math.max(overlap - COLLISION_SLOP, 0) * COLLISION_PUSH
        if (separation > 0) {
          const move1 = separation * (other.mass / (body.mass + other.mass))
          const move2 = separation * (body.mass / (body.mass + other.mass))
          _pos.addScaledVector(_normal, move1)
          _p1.addScaledVector(_normal, -move2)
        }

        const v1n = _vel.dot(_normal)
        const v2n = _v1.dot(_normal)
        const relNormalVel = v1n - v2n
        const m1 = body.mass
        const m2 = other.mass
        const restitution = Math.min(body.restitution, other.restitution)

        if (relNormalVel < 0) {
          const impulse = (-(1 + restitution) * relNormalVel) / ((1 / m1) + (1 / m2))
          _vel.addScaledVector(_normal, impulse / m1)
          _v1.addScaledVector(_normal, -impulse / m2)
        }

        _vel.multiplyScalar(1 - fric * 0.04)
        _v1.multiplyScalar(1 - fric * 0.04)

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

  relaxOverlaps(bodies)
}

// ─── Instanced 3D shapes ─────────────────────────────────────────
const _dummy = new THREE.Object3D()

function ShapeInstances() {
  const meshRefs = useRef<Map<number, THREE.InstancedMesh>>(new Map())
  const { camera } = useThree()
  const mouseNDC = useRef({ x: 0, y: 0 })
  const isFirstFrame = useRef(true)

  const icosaGeom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.5, 0)
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
      flatShading: g.type === 'icosahedron',
      envMapIntensity: g.metalness > 0.15 ? 0.38 : 0.12,
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
          args={[group.type === 'icosahedron' ? icosaGeom : sphereGeom, materials[gi], group.count]}
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
    const targetZ = 17.5 - Math.min(elapsed / 2, 1) * 2.8
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03
  })

  return (
    <>
      <color attach="background" args={['#151618']} />
      <Environment preset="city" environmentIntensity={0.28} />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={['#c8c8cc', '#151618', 0.55]} />
      <directionalLight position={[8, 12, 6]} intensity={0.85} />
      <directionalLight position={[-6, -4, 4]} intensity={0.35} />
      <pointLight position={[0, 0, 10]} intensity={0.35} decay={2} distance={40} />
      <ShapeInstances />
    </>
  )
}

// ─── Exported component ──────────────────────────────────────────
export default function CrossBalloons() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9', background: '#151618' }}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 18], fov: 30, near: 0.1, far: 120 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
