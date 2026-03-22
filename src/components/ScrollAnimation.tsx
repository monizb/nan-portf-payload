'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

interface ScrollAnimationProps {
  glbUrl: string
  onAnimationComplete?: () => void
}

export default function ScrollAnimation({ glbUrl, onAnimationComplete }: ScrollAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)
  const hasCompletedRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  const initScene = useCallback(() => {
    if (!canvasContainerRef.current) return

    const isMobile = window.innerWidth < 768
    const TARGET_CAMERA = 'DutchCamera001'

    // Set body terracotta background to prevent white flash
    document.body.classList.add('animation-active')

    const scrollSection = containerRef.current!
    const stableVH = window.innerHeight
    const sectionHeight = scrollSection.offsetHeight
    const maxScroll = Math.max(1, sectionHeight - stableVH)

    let targetProgress = 0
    let currentProgress = 0

    const onScroll = () => {
      targetProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll))
    }
    window.addEventListener('scroll', onScroll, { passive: true })

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
    renderer.setClearColor('#D97757')
    canvasContainerRef.current.appendChild(renderer.domElement)

    let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1.2, 6)
    camera.lookAt(0, 1, 0)
    let mixer: THREE.AnimationMixer | null = null
    let animationDuration = 0
    let glbCamera: THREE.PerspectiveCamera | null = null
    const actions: THREE.AnimationAction[] = []

    // Add fallback lighting for models without baked lights.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(4, 7, 6)
    scene.add(ambientLight)
    scene.add(directionalLight)

    // Load GLB
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
              action.paused = true
              action.play()
              actions.push(action)
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
    onScroll()

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

      currentProgress = lerp(currentProgress, targetProgress, 0.05)
      if (Math.abs(currentProgress - targetProgress) < 0.005) {
        currentProgress = targetProgress
      }

      // Check if animation is complete (>98%) for transition
      if (currentProgress > 0.98 && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        onAnimationComplete?.()
      }

      // Allow reverse: if user scrolls back, reset completion
      if (currentProgress < 0.90 && hasCompletedRef.current) {
        hasCompletedRef.current = false
      }

      // Scrub animations by directly setting action time (supports reverse)
      if (mixer && animationDuration > 0) {
        const targetTime = Math.min(currentProgress * animationDuration, animationDuration - 0.01)
        for (const action of actions) {
          action.paused = false
          action.time = targetTime
          action.paused = true
        }
        mixer.update(0)
        if (glbCamera) {
          glbCamera.near = 0.001
          glbCamera.far = 1000
          glbCamera.updateProjectionMatrix()
        }
      }

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

    // Cleanup function
    cleanupRef.current = () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      document.body.classList.remove('animation-active')
      renderer.dispose()
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = ''
      }
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
      <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
        <div
          ref={canvasContainerRef}
          className="fixed top-0 left-0 w-full h-screen"
          style={{ zIndex: 10 }}
        />
      </div>
      <div
        ref={progressBarRef}
        className="fixed bottom-0 left-0 h-[3px] bg-white"
        style={{ zIndex: 20, width: '0%' }}
      />
      <div
        ref={scrollHintRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center px-6 h-10 rounded-full transition-opacity duration-600"
        style={{ zIndex: 30, background: 'rgba(10, 10, 10, 0.8)' }}
      >
        <span className="whitespace-nowrap text-[11px] font-medium tracking-[0.13em] text-white font-sans">
          SCROLL TO ANIMATE
        </span>
      </div>
    </>
  )
}
