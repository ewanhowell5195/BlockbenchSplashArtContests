document.getElementById("scroll-hint").addEventListener("click", e => {
  e.preventDefault()
  document.getElementById("home-sections").scrollIntoView({ behavior: "smooth" })
})

const modelContainer = document.getElementById("home-model")
if (modelContainer && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let started = false
  const loadObserver = new IntersectionObserver(async entries => {
    if (!entries.some(e => e.isIntersecting) || started) return
    started = true
    loadObserver.disconnect()
    try {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/three@0.170.0/+esm"),
        import("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js/+esm")
      ])
      const gltf = await new GLTFLoader().loadAsync("/assets/models/pickup_truck.glb")

      const canvas = modelContainer.querySelector("canvas")
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 1000)
      scene.add(new THREE.AmbientLight(0xffffff, 1.8))
      const sun = new THREE.DirectionalLight(0xffffff, 2.4)
      sun.position.set(-4, 8, -6)
      scene.add(sun)

      const model = gltf.scene
      const pieces = []
      model.traverse(object => {
        if (object.isMesh) {
          object.material.metalness = 0
          object.material.roughness = 1
          if (object.material.map) {
            object.material.map.magFilter = THREE.NearestFilter
            object.material.map.minFilter = THREE.NearestFilter
            object.material.map.generateMipmaps = false
            object.material.map.needsUpdate = true
          }
          object.userData.scale = object.scale.clone()
          pieces.push(object)
        }
      })

      const pivot = new THREE.Group()
      scene.add(pivot)
      pivot.add(model)
      const sceneBox = new THREE.Box3().setFromObject(model)
      const sceneCenter = sceneBox.getCenter(new THREE.Vector3())
      const sceneRadius = sceneBox.getSize(new THREE.Vector3()).length() / 2
      model.position.sub(sceneCenter)
      scene.updateMatrixWorld(true)

      const minSize = sceneRadius * 0.06
      const groundPieces = new Set()
      model.getObjectByName("ground")?.traverse(object => {
        if (object.isMesh) groundPieces.add(object)
      })
      let truckCount = 0
      model.getObjectByName("pickup_truck")?.traverse(object => {
        if (object.isMesh) truckCount++
      })

      const tmpBox = new THREE.Box3()
      const tmpVec = new THREE.Vector3();
      ["stream", "trees", "grass", "foliage"].forEach((name, g) => {
        const members = new Set()
        model.getObjectByName(name)?.traverse(object => {
          if (object.isMesh) members.add(object)
        })
        if (!members.size) return
        const indices = []
        const slice = []
        pieces.forEach((piece, i) => {
          if (members.has(piece)) {
            indices.push(i)
            slice.push(piece)
          }
        })
        const direction = g % 2 ? 1 : -1
        const keys = new Map()
        for (const piece of slice) {
          const center = tmpBox.setFromObject(piece).getCenter(tmpVec)
          keys.set(piece, direction * (center.x - center.z))
        }
        slice.sort((a, b) => keys.get(a) - keys.get(b))
        indices.forEach((index, j) => pieces[index] = slice[j])
      })

      const WINDOW = 20
      const boxes = pieces.map(piece => new THREE.Box3().setFromObject(piece))
      const centers = []
      const sizes = []
      const clampSize = size => {
        size.x = Math.max(size.x, minSize)
        size.y = Math.max(size.y, minSize)
        size.z = Math.max(size.z, minSize)
        return size
      }
      const grownBox = new THREE.Box3()
      const windowBox = new THREE.Box3()
      for (let i = 0; i < pieces.length; i++) {
        if (i < truckCount) {
          grownBox.union(boxes[i])
          centers.push(grownBox.getCenter(new THREE.Vector3()))
          sizes.push(clampSize(grownBox.getSize(new THREE.Vector3())))
        } else {
          windowBox.makeEmpty()
          let any = false
          for (let j = Math.max(0, i - WINDOW + 1); j <= i; j++) {
            if (groundPieces.has(pieces[j])) continue
            windowBox.union(boxes[j])
            any = true
          }
          if (any) {
            centers.push(windowBox.getCenter(new THREE.Vector3()))
            sizes.push(clampSize(windowBox.getSize(new THREE.Vector3())))
          } else {
            centers.push(centers[i - 1])
            sizes.push(sizes[i - 1])
          }
        }
      }

      const fullBox = new THREE.Box3()
      for (let i = 0; i < pieces.length; i++) {
        if (!groundPieces.has(pieces[i])) fullBox.union(boxes[i])
      }
      const fullCenter = fullBox.getCenter(new THREE.Vector3())
      const fullSize = clampSize(fullBox.getSize(new THREE.Vector3()))

      const paces = { pickup_truck: 36, ground: 22, stream: 70, ramp: 28, trees: 22, grass: 5, foliage: 18 }
      const pieceGroup = new Map()
      for (const child of model.children) {
        child.traverse(object => {
          if (object.isMesh) pieceGroup.set(object, child.name)
        })
      }
      const startTimes = []
      let total = 0
      for (const piece of pieces) {
        startTimes.push(total)
        total += paces[pieceGroup.get(piece)] ?? 16
      }

      const groupEnd = new Array(pieces.length)
      let segmentEnd = pieces.length - 1
      for (let i = pieces.length - 1; i >= 0; i--) {
        if (i < pieces.length - 1 && pieceGroup.get(pieces[i]) !== pieceGroup.get(pieces[i + 1])) segmentEnd = i
        groupEnd[i] = segmentEnd
      }

      function indexAt(elapsed) {
        let low = 0
        let high = startTimes.length - 1
        while (low < high) {
          const mid = (low + high + 1) >> 1
          if (startTimes[mid] <= elapsed) low = mid
          else high = mid - 1
        }
        return low
      }

      for (const piece of pieces) {
        piece.visible = false
      }

      const camDir = new THREE.Vector3(-1.55, 0.85, -1.55).normalize()
      const elevation = Math.asin(camDir.y)
      const tanV = Math.tan(camera.fov * Math.PI / 360)
      function fitDistance(size) {
        const depth = Math.hypot(size.x, size.z)
        const width = (size.x + size.z) / Math.SQRT2
        const height = size.y * Math.cos(elevation) + depth * Math.sin(elevation)
        return Math.max(height / 2 / tanV, width / 2 / (tanV * camera.aspect)) * 1.04 + depth * 0.35
      }
      const camTarget = new THREE.Vector3()
      const lookSmooth = new THREE.Vector3()

      function resetCamera() {
        camera.position.copy(centers[0]).addScaledVector(camDir, fitDistance(sizes[0]))
        lookSmooth.copy(centers[0])
      }
      resetCamera()

      function resize() {
        const width = modelContainer.clientWidth
        const height = modelContainer.clientHeight
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      new ResizeObserver(resize).observe(modelContainer)

      document.getElementById("home-showcase").classList.remove("hidden")
      resize()

      const BUILD = total
      const POP = 500
      const easeOutBack = t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
      const smooth = t => t * t * (3 - 2 * t)

      let running = true
      let startTime = null
      let lastTime = null
      let rotation = 0
      let frame

      function animate(now) {
        frame = requestAnimationFrame(animate)
        if (startTime === null) startTime = now
        const delta = Math.min(50, now - (lastTime ?? now))
        lastTime = now
        const elapsed = now - startTime
        for (const [i, piece] of pieces.entries()) {
          const t = (elapsed - startTimes[i]) / POP
          if (t <= 0) {
            piece.visible = false
          } else {
            piece.visible = true
            piece.scale.copy(piece.userData.scale).multiplyScalar(t >= 1 ? 1 : easeOutBack(t))
          }
        }
        const damp = 1 - Math.exp(-delta / 800)
        if (elapsed >= BUILD) {
          camTarget.copy(fullCenter).addScaledVector(camDir, fitDistance(fullSize))
          camera.position.lerp(camTarget, damp)
          lookSmooth.lerp(fullCenter, damp)
        } else {
          const index = Math.min(indexAt(elapsed + 900), groupEnd[indexAt(elapsed)])
          camTarget.copy(centers[index]).addScaledVector(camDir, fitDistance(sizes[index]))
          camera.position.lerp(camTarget, damp)
          lookSmooth.lerp(centers[index], damp)
        }
        camera.lookAt(lookSmooth)
        const spin = elapsed - BUILD - POP
        if (spin > 0) {
          rotation += delta * 0.0002 * smooth(Math.min(1, spin / 2500))
        }
        pivot.rotation.y = rotation
        renderer.render(scene, camera)
      }

      new IntersectionObserver(entries => {
        const visible = entries.some(e => e.isIntersecting)
        if (visible && !running) {
          running = true
          lastTime = null
          frame = requestAnimationFrame(animate)
        } else if (!visible && running) {
          running = false
          cancelAnimationFrame(frame)
        }
      }).observe(modelContainer)

      modelContainer.addEventListener("click", () => {
        startTime = null
        rotation = 0
        pivot.rotation.y = 0
        resetCamera()
      })

      frame = requestAnimationFrame(animate)
    } catch (err) {}
  }, { rootMargin: "600px" })
  loadObserver.observe(document.getElementById("home-about"))
}

const backgrounds = document.getElementById("home-background-container")
if (backgrounds.children.length > 1) {
  const progress = document.getElementById("progress-bar")
  const contents = document.getElementById("home-content-container")
  let timeout, processing
  function next(prev) {
    if (processing) return
    processing = true
    clearTimeout(timeout)
    progress.style.transition = "initial"
    progress.style.right = "118px"
    const currentBackground = backgrounds.children[0]
    const nextBackground = prev ? backgrounds.children[backgrounds.children.length - 1] : backgrounds.children[1]
    const currentContent = contents.children[1]
    const nextContent = prev ? contents.children[contents.children.length - 1] : contents.children[2]
    if (prev) {
      backgrounds.classList.add("reverse")
      contents.classList.add("reverse")
      nextBackground.classList.add("hidden")
      nextContent.classList.add("hidden")
    }
    requestAnimationFrame(() => {
      nextBackground.classList.remove("hidden")
      nextContent.classList.remove("hidden")
      requestAnimationFrame(() => {
        currentBackground.classList.add("leave")
        currentContent.classList.add("leave")
        nextBackground.classList.remove("enter")
        nextContent.classList.remove("enter")
        setTimeout(() => {
          currentBackground.classList.remove("leave")
          currentBackground.classList.add("enter")
          currentContent.classList.remove("leave")
          currentContent.classList.add("enter")
          if (prev) {
            backgrounds.prepend(nextBackground)
            contents.insertBefore(nextContent, progress.parentNode.parentNode.children[1])
            backgrounds.classList.remove("reverse")
            contents.classList.remove("reverse")
          } else {
            backgrounds.append(currentBackground)
            contents.append(currentContent)
          }
          progress.style.transition = null
          progress.style.right = 0
          processing = false
        }, 500)
      })
    })
    if (pausePlay.textContent === "pause") {
      timeout = setTimeout(() => next(), 8000)
    }
  }
  document.getElementById("prev").addEventListener("click", () => next(true))
  document.getElementById("next").addEventListener("click", () => next())
  const pausePlay = document.getElementById("pause-play")
  pausePlay.addEventListener("click", e => {
    if (pausePlay.textContent === "pause") {
      pausePlay.textContent = "play_arrow"
      progress.hidden = true
      clearTimeout(timeout)
    } else {
      pausePlay.textContent = "pause"
      progress.style.right = "118px"
      progress.hidden = false
      setTimeout(() => {
        progress.style.right = 0
        timeout = setTimeout(() => next(), 8000)
      }, 10)
    }
  })
  setTimeout(() => progress.style.right = 0, 500)
  timeout = setTimeout(() => next(), 8000)
}