'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

interface ScrollAnimationProps {
  glbUrl: string
  active: boolean
  onAnimationComplete?: () => void
}

export default function ScrollAnimation({ glbUrl, active, onAnimationComplete }: ScrollAnimationProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)
  const hasCompletedRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)
  const resetScrollRef = useRef<(() => void) | null>(null)
  // Shared mutable ref so the wheel handler always sees the latest active state
  const activeRef = useRef(active)
  const sceneReadyRef = useRef(false)

  // Keep activeRef in sync
  useEffect(() => {
    activeRef.current = active

    if (active) {
      // Entering animation mode: reset scroll to start, lock body scroll, show canvas
      resetScrollRef.current?.()  // rewind virtualScroll/progress to 0 so completion doesn't fire instantly
      hasCompletedRef.current = false
      document.body.style.overflow = 'hidden'
      document.body.classList.add('animation-active')
      if (canvasContainerRef.current) canvasContainerRef.current.style.display = ''
      if (progressBarRef.current) progressBarRef.current.style.display = ''
    } else {
      // Leaving animation mode: unlock body scroll, hide canvas
      document.body.style.overflow = ''
      document.body.classList.remove('animation-active')
      if (canvasContainerRef.current) canvasContainerRef.current.style.display = 'none'
      if (progressBarRef.current) progressBarRef.current.style.display = 'none'
    }
  }, [active])

  const initScene = useCallback(() => {
    if (!canvasContainerRef.current || sceneReadyRef.current) return
    sceneReadyRef.current = true

    const isMobile = window.innerWidth < 768
    const TARGET_CAMERA = 'DutchCamera001'

    document.body.style.overflow = 'hidden'
    document.body.classList.add('animation-active')

    // Virtual scroll progress driven by wheel / touch delta
    const VIRTUAL_SCROLL_LENGTH = 4000
    let virtualScroll = 0
    let targetProgress = 0
    let currentProgress = 0

    // Expose a reset so the active useEffect can rewind to the start
    resetScrollRef.current = () => {
      virtualScroll = 0
      targetProgress = 0
      currentProgress = 0
    }

    const onWheel = (e: WheelEvent) => {
      if (!activeRef.current) return // don't intercept when inactive
      e.preventDefault()
      virtualScroll = Math.max(0, Math.min(VIRTUAL_SCROLL_LENGTH, virtualScroll + e.deltaY))
      targetProgress = virtualScroll / VIRTUAL_SCROLL_LENGTH
    }

    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current) return
      e.preventDefault()
      const delta = touchStartY - e.touches[0].clientY
      touchStartY = e.touches[0].clientY
      virtualScroll = Math.max(0, Math.min(VIRTUAL_SCROLL_LENGTH, virtualScroll + delta * 2))
      targetProgress = virtualScroll / VIRTUAL_SCROLL_LENGTH
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    // Mouse tracking (parallax)
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onMouseLeave = () => {
      mouse.tx = 0
      mouse.ty = 0
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    // Three.js setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#D97757')

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: isMobile ? 'low-power' : 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.75
    canvasContainerRef.current.appendChild(renderer.domElement)

    let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    let mixer: THREE.AnimationMixer | null = null
    let animationDuration = 0
    let glbCamera: THREE.PerspectiveCamera | null = null

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    const loadModel = (url: string, hasRetried = false) => {
      loader.load(
        url,
        (gltf) => {
          scene.add(gltf.scene)

          gltf.scene.traverse((child) => {
            if (child.name === TARGET_CAMERA || child.name.includes(TARGET_CAMERA)) {
              if ((child as THREE.Camera).isCamera) {
                glbCamera = child as THREE.PerspectiveCamera
              } else {
                child.traverse((sub) => {
                  if ((sub as THREE.Camera).isCamera) glbCamera = sub as THREE.PerspectiveCamera
                })
              }
            }
            if ((child as THREE.Camera).isCamera && !glbCamera) glbCamera = child as THREE.PerspectiveCamera
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh
              if (mesh.material) (mesh.material as THREE.Material).side = THREE.DoubleSide
              mesh.frustumCulled = false
            }
          })

          if (!glbCamera && gltf.cameras.length > 0) {
            glbCamera = (gltf.cameras.find((c) => c.name.includes(TARGET_CAMERA)) ||
              gltf.cameras[0]) as THREE.PerspectiveCamera
          }

          if (glbCamera) {
            glbCamera.aspect = window.innerWidth / window.innerHeight
            glbCamera.near = 0.01
            glbCamera.far = 1000
            glbCamera.updateProjectionMatrix()
            camera = glbCamera
          }

          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(gltf.scene)
            gltf.animations.forEach((clip) => {
              const action = mixer!.clipAction(clip)
              action.setLoop(THREE.LoopOnce, 1)
              action.clampWhenFinished = true
              action.play()
            })
            animationDuration = Math.max(...gltf.animations.map((a) => a.duration))
          }

          setTimeout(() => {
            if (scrollHintRef.current) scrollHintRef.current.style.opacity = '0'
          }, 3000)
        },
        undefined,
        () => {
          if (!hasRetried && url !== '/Sprint.glb') {
            loadModel('/Sprint.glb', true)
            return
          }
          if (scrollHintRef.current) {
            scrollHintRef.current.style.opacity = '1'
            scrollHintRef.current.innerHTML =
              '<span class="whitespace-nowrap text-[11px] font-medium tracking-[0.13em] text-white font-sans">MODEL LOAD FAILED</span>'
          }
        }
      )
    }

    loadModel(glbUrl)

    // Render loop
    const savedPos = new THREE.Vector3()
    const savedRot = new THREE.Euler()
    let lastTime = 0
    let animFrameId: number

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    function animate(time: number) {
      animFrameId = requestAnimationFrame(animate)

      if (time - lastTime < 16) return
      lastTime = time

      // Always lerp toward target so the animation stays smooth
      currentProgress = lerp(currentProgress, targetProgress, 0.05)
      if (Math.abs(currentProgress - targetProgress) < 0.005) {
        currentProgress = targetProgress
      }

      // Only fire completion when active and progress > 98%
      if (activeRef.current && currentProgress > 0.98 && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        onAnimationComplete?.()
      }

      // Scrub animations
      if (mixer && animationDuration > 0) {
        const targetTime = Math.min(currentProgress * animationDuration, animationDuration - 0.01)
        mixer.setTime(targetTime)
        if (glbCamera) {
          glbCamera.near = 0.001
          glbCamera.far = 1000
          glbCamera.updateProjectionMatrix()
        }
      }

      // Only render when active (save GPU when hidden)
      if (!activeRef.current) return

      savedPos.copy(camera.position)
      savedRot.copy(camera.rotation)

      if (!isMobile && glbCamera && mixer) {
        mouse.x = lerp(mouse.x, mouse.tx, 0.06)
        mouse.y = lerp(mouse.y, mouse.ty, 0.06)

        const intensity = lerp(0.2, 1.4, Math.min(currentProgress / 0.3, 1.0))
        camera.position.x += mouse.x * intensity
        camera.position.y += mouse.y * 0.15
        camera.position.y = Math.min(camera.position.y, 0.6)
        camera.rotation.y -= mouse.x * 0.04
      }

      if (isMobile) {
        camera.position.x += 0.35
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${currentProgress * 100}%`
      }

      renderer.render(scene, camera)

      camera.position.copy(savedPos)
      camera.rotation.copy(savedRot)
    }

    animFrameId = requestAnimationFrame(animate)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    cleanupRef.current = () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = ''
      document.body.classList.remove('animation-active')
      renderer.dispose()
      resetScrollRef.current = null
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = ''
      }
      // Reset guard so remount (React Strict Mode) can reinitialize
      sceneReadyRef.current = false
    }
  }, [glbUrl, onAnimationComplete])

  useEffect(() => {
    initScene()
    return () => {
      cleanupRef.current?.()
    }
  }, [initScene])

  return (
    <>
      <div
        ref={canvasContainerRef}
        className="fixed top-0 left-0 w-full h-screen pointer-events-none"
        style={{ zIndex: 100 }}
      />
      <div
        ref={progressBarRef}
        className="fixed bottom-0 left-0 h-[3px] bg-white"
        style={{ zIndex: 110, width: '0%' }}
      />
      <div
        ref={scrollHintRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center px-6 h-10 rounded-full transition-opacity duration-600"
        style={{ zIndex: 110, background: 'rgba(10, 10, 10, 0.8)' }}
      >
        <span className="whitespace-nowrap text-[11px] font-medium tracking-[0.13em] text-white font-sans">
          SCROLL TO ANIMATE
        </span>
      </div>
    </>
  )
}
