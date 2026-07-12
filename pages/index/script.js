document.getElementById("scroll-hint").addEventListener("click", e => {
  e.preventDefault()
  document.getElementById("home-sections").scrollIntoView({ behavior: "smooth" })
})

const modelContainer = document.getElementById("home-model")
if (modelContainer && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const SCENES = [
    {
      model: "/assets/models/snowplough.glb",
      render: "/assets/images/submissions/5/85f1c3b546cfcaf30c7da8f5e638ee32e7cb004c5ac8d694fffa525e16b19d59.webp",
      order: ["snowplough/wheels", "snowplough/plough", "snowplough/container", "snowplough/railing", "snowplough/ladder_left", "snowplough/ladder_right", "snowplough", "snowplough/front", "snowplough/light", "snowplough/exhaust", "snowplough/mirrors", "vehicle_decorations", "ground", "snow", "house", "trees", "grass"],
      primary: ["snowplough", "vehicle_decorations"],
      ground: ["ground", "snow"],
      sweep: ["trees", "grass"],
      paces: { snowplough: 36, vehicle_decorations: 28, ground: 40, snow: 40, house: 30, trees: 22, grass: 5 },
      dim: [0.12, 0.05],
      blend: {
        min: [-78.125, -202.911, -0.684],
        max: [128.125, 110, 81.25],
        camera: [
          [-6.2781, 2.6989, -6.8584, -120.1949],
          [-7.3704, -2.299, 5.842, 111.5356],
          [0, 9.0093, 3.5453, 74.0683]
        ],
        tanHalfH: 0.27,
        lights: [
          [3.818, 20.717, 27.637, 1, 0.153, 0, 500],
          [-4.012, 20.596, 27.555, 1, 0.153, 0, 500],
          [-4.012, 19.281, 28.339, 1, 0.153, 0, 500],
          [-0.019, 20.596, 27.555, 0.947, 1, 0.479, 500],
          [3.892, 19.451, 28.648, 1, 0.153, 0, 1000],
          [-0.019, 19.765, 28.749, 0.947, 1, 0.479, 500],
          [-7.501, 20.596, 27.555, 0.947, 1, 0.479, 2000],
          [7.055, 20.596, 27.555, 0.947, 1, 0.479, 2000],
          [8.146, 23.212, 17.507, 0.947, 1, 0.479, 2000],
          [-7.965, 22.818, 17.507, 0.947, 1, 0.479, 2000],
          [-7.965, 24.333, 6.029, 0.947, 1, 0.479, 2000],
          [7.993, 24.333, 6.029, 0.947, 1, 0.479, 2000],
          [-7.965, -20.628, 7.403, 1, 0.019, 0, 2000],
          [6.959, -20.628, 7.403, 1, 0.019, 0, 2000],
          [27.472, -81.346, 19.873, 0.947, 1, 0.479, 3000],
          [65.358, 23.212, 14.371, 1, 0.829, 0.529, 20000]
        ],
        sun: { dir: [0.7928, 0.2514, -0.5552], color: [0.223, 0.335, 1], intensity: 1.2 }
      }
    },
    {
      model: "/assets/models/pickup_truck.glb",
      render: "/assets/images/submissions/6/42202c18dc73ec509fd27af18add380594d17a6da4ef2bcb414250b48e9952ef.webp",
      order: ["pickup_truck", "ground", "stream", "ramp", "trees", "grass", "foliage"],
      primary: ["pickup_truck"],
      ground: ["ground"],
      sweep: ["stream", "trees", "grass", "foliage"],
      paces: { pickup_truck: 36, ground: 22, stream: 70, ramp: 28, trees: 22, grass: 5, foliage: 18 },
      dim: [0.3, 0.3],
      blend: {
        min: [-118.5672, -363.75, -3.8623],
        max: [369.375, 114.375, 84.375],
        camera: [
          [-5.6836, 3.2471, -7.1337, -97.5216],
          [-7.8324, -2.6857, 5.0177, 67.1612],
          [-0.296, 8.7167, 4.2034, 85.1652]
        ],
        tanHalfH: 0.27,
        lights: [
          [3.2634, 3.4827, 42.0315, 1, 0.2789, 0, 10000],
          [-3.7495, 3.4827, 42.0315, 1, 0.2789, 0, 10000],
          [-1.8119, 13.7921, 38.2485, 0.8689, 0.8619, 0.3905, 10000],
          [1.9054, 13.7921, 38.2485, 0.8689, 0.8619, 0.3905, 10000],
          [-3.8246, 14.948, 35.4599, 0.8689, 0.8619, 0.3905, 10000],
          [3.7329, 14.948, 35.4599, 0.8689, 0.8619, 0.3905, 10000]
        ],
        sun: { dir: [0.3056, -0.5684, -0.7638], color: [0.9258, 0.9157, 0.807], intensity: 3 }
      }
    }
  ]

  let started = false
  const loadObserver = new IntersectionObserver(async entries => {
    if (!entries.some(e => e.isIntersecting) || started) return
    started = true
    loadObserver.disconnect()
    try {
      const [THREE, { GLTFLoader }, { OrbitControls }] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/three@0.170.0/+esm"),
        import("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js/+esm"),
        import("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js/+esm")
      ])

      const canvas = modelContainer.querySelector("canvas")
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

      const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 1000)
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true
      controls.enabled = false
      canvas.style.touchAction = "pan-y"

      const modelButtons = document.getElementById("model-buttons")
      const renderImg = document.getElementById("model-render")
      const tabs = [...document.querySelectorAll(".model-tab")]

      const loader = new GLTFLoader()
      const gltfCache = new Map()
      const loadModel = url => {
        if (!gltfCache.has(url)) gltfCache.set(url, loader.loadAsync(url))
        return gltfCache.get(url)
      }

      const conv = v => new THREE.Vector3(v.x ?? v[0], v.z ?? v[2], -(v.y ?? v[1]))
      const camDir = new THREE.Vector3(-1.55, 0.85, -1.55).normalize()
      const elevation = Math.asin(camDir.y)
      const tanV = Math.tan(30 * Math.PI / 360)
      const easeOutBack = t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
      const smooth = t => t * t * (3 - 2 * t)
      const clamp01 = t => Math.min(1, Math.max(0, t))
      const tmpBox = new THREE.Box3()
      const tmpVec = new THREE.Vector3()

      const WINDOW = 20
      const POP = 500
      const OVERVIEW = 800
      const GLIDE = 2400
      const DIM = 700
      const RAMP = 500

      let active = null

      function fitDistance(size) {
        const depth = Math.hypot(size.x, size.z)
        const width = (size.x + size.z) / Math.SQRT2
        const height = size.y * Math.cos(elevation) + depth * Math.sin(elevation)
        return Math.max(height / 2 / tanV, width / 2 / (tanV * camera.aspect)) * 1.04 + depth * 0.35
      }

      function buildScene(config, gltf) {
        const scene = new THREE.Scene()
        const ambient = new THREE.AmbientLight(0xffffff, 1.8)
        scene.add(ambient)
        const buildSun = new THREE.DirectionalLight(0xffffff, 2.4)
        buildSun.position.set(-4, 8, -6)
        scene.add(buildSun)

        const model = gltf.scene
        scene.add(model)
        const pieceGroup = new Map()
        const orderKey = new Map()
        for (const child of model.children) {
          child.traverse(object => {
            if (object.isMesh) {
              pieceGroup.set(object, child.name)
              orderKey.set(object, child.name)
            }
          })
          for (const sub of child.children) {
            if (sub.isMesh) continue
            sub.traverse(object => {
              if (object.isMesh) orderKey.set(object, `${child.name}/${sub.name}`)
            })
          }
        }
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
            if (!object.userData.scale) object.userData.scale = object.scale.clone()
            object.scale.copy(object.userData.scale)
            pieces.push(object)
          }
        })

        if (!model.userData.sceneBox) {
          model.userData.sceneBox = new THREE.Box3().setFromObject(model)
          model.position.sub(model.userData.sceneBox.getCenter(new THREE.Vector3()))
        }
        const sceneSize = model.userData.sceneBox.getSize(new THREE.Vector3())
        const sceneRadius = sceneSize.length() / 2
        scene.updateMatrixWorld(true)

        const orderIndex = new Map(config.order.map((name, i) => [name, i]))
        const orderOf = piece => orderIndex.get(orderKey.get(piece)) ?? orderIndex.get(pieceGroup.get(piece)) ?? 99
        pieces.sort((a, b) => orderOf(a) - orderOf(b))

        const groundPieces = new Set(pieces.filter(piece => config.ground.includes(pieceGroup.get(piece))))
        let primaryCount = 0
        for (const piece of pieces) {
          if (config.primary.includes(pieceGroup.get(piece))) primaryCount++
        }

        config.sweep.forEach((name, g) => {
          const indices = []
          const slice = []
          pieces.forEach((piece, i) => {
            if (pieceGroup.get(piece) === name) {
              indices.push(i)
              slice.push(piece)
            }
          })
          if (!slice.length) return
          const direction = g % 2 ? 1 : -1
          const keys = new Map()
          for (const piece of slice) {
            const center = tmpBox.setFromObject(piece).getCenter(tmpVec)
            keys.set(piece, direction * (center.x - center.z))
          }
          slice.sort((a, b) => keys.get(a) - keys.get(b))
          indices.forEach((index, j) => pieces[index] = slice[j])
        })

        const minSize = sceneRadius * 0.06
        const clampSize = size => {
          size.x = Math.max(size.x, minSize)
          size.y = Math.max(size.y, minSize)
          size.z = Math.max(size.z, minSize)
          return size
        }
        const boxes = pieces.map(piece => new THREE.Box3().setFromObject(piece))
        const centers = []
        const sizes = []
        const grownBox = new THREE.Box3()
        const windowBox = new THREE.Box3()
        for (let i = 0; i < pieces.length; i++) {
          if (i < primaryCount) {
            grownBox.union(boxes[i])
            centers.push(grownBox.getCenter(new THREE.Vector3()))
            sizes.push(clampSize(grownBox.getSize(new THREE.Vector3())))
          } else {
            windowBox.makeEmpty()
            let any = false
            for (let j = i, count = 0; j >= 0 && count < WINDOW; j--) {
              if (groundPieces.has(pieces[j])) continue
              windowBox.union(boxes[j])
              any = true
              count++
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

        const startTimes = []
        let total = 0
        for (const piece of pieces) {
          startTimes.push(total)
          total += config.paces[pieceGroup.get(piece)] ?? 16
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

        const B = config.blend
        const bmin = new THREE.Vector3(B.min[0], B.min[2], -B.max[1])
        const bmax = new THREE.Vector3(B.max[0], B.max[2], -B.min[1])
        const mapScale = sceneSize.x / (bmax.x - bmin.x)
        const mapOffset = bmin.clone().add(bmax).multiplyScalar(-mapScale / 2)
        const mapPoint = p => conv(p).multiplyScalar(mapScale).add(mapOffset)
        const camAxis = i => new THREE.Vector3(B.camera[0][i], B.camera[1][i], B.camera[2][i]).normalize()
        const shotQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(conv(camAxis(0)), conv(camAxis(1)), conv(camAxis(2))))
        const shotPos = mapPoint([B.camera[0][3], B.camera[1][3], B.camera[2][3]])
        const shotFov = () => Math.atan(B.tanHalfH / camera.aspect) * 360 / Math.PI

        const shotLights = []
        for (const l of B.lights) {
          const light = new THREE.PointLight(new THREE.Color(l[3], l[4], l[5]), 0, 0, 2)
          light.position.copy(mapPoint(l))
          light.userData.max = l[6] / (4 * Math.PI) * mapScale * mapScale
          scene.add(light)
          shotLights.push(light)
        }
        const shotSun = new THREE.DirectionalLight(new THREE.Color(B.sun.color[0], B.sun.color[1], B.sun.color[2]), 0)
        shotSun.position.copy(fullCenter).addScaledVector(conv(B.sun.dir), -sceneRadius * 2)
        shotSun.target.position.copy(fullCenter)
        shotSun.userData.max = B.sun.intensity
        scene.add(shotSun)
        scene.add(shotSun.target)
        shotLights.push(shotSun)

        const BUILD = total
        const STAGGER = Math.min(240, 2400 / shotLights.length)
        const tGlide = BUILD + POP + OVERVIEW
        const tDim = tGlide + GLIDE + 300
        const tLights = tDim + DIM
        const tDone = tLights + (shotLights.length - 1) * STAGGER + RAMP + 600

        const camTarget = new THREE.Vector3()
        const lookSmooth = new THREE.Vector3()
        let startTime = null
        let lastTime = null
        let glideStart = null
        let finished = false

        return {
          config,
          restart() {
            startTime = null
            lastTime = null
            glideStart = null
            finished = false
            controls.enabled = false
            canvas.style.cursor = ""
            modelButtons.classList.add("hidden")
            renderImg.classList.remove("visible")
            ambient.intensity = 1.8
            buildSun.intensity = 2.4
            for (const light of shotLights) light.intensity = 0
            for (const piece of pieces) piece.visible = false
            camera.fov = 30
            camera.position.copy(centers[0]).addScaledVector(camDir, fitDistance(sizes[0]))
            camera.updateProjectionMatrix()
            lookSmooth.copy(centers[0])
            camera.lookAt(lookSmooth)
          },
          setShotCamera() {
            camera.position.copy(shotPos)
            camera.quaternion.copy(shotQuat)
            camera.fov = shotFov()
            camera.updateProjectionMatrix()
            controls.target.copy(shotPos).addScaledVector(camera.getWorldDirection(tmpVec), shotPos.distanceTo(fullCenter))
          },
          resetShot() {
            if (!finished) return
            this.setShotCamera()
            renderImg.classList.add("visible")
          },
          applyFov() {
            if (finished) camera.fov = shotFov()
          },
          resume() {
            lastTime = null
          },
          animate(now) {
            if (startTime === null) startTime = now
            const delta = Math.min(50, now - (lastTime ?? now))
            lastTime = now
            const elapsed = now - startTime
            if (finished) {
              controls.update()
              renderer.render(scene, camera)
              return
            }
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
            if (elapsed >= tGlide) {
              if (!glideStart) glideStart = { pos: camera.position.clone(), quat: camera.quaternion.clone(), fov: camera.fov }
              const k = smooth(clamp01((elapsed - tGlide) / GLIDE))
              camera.position.lerpVectors(glideStart.pos, shotPos, k)
              camera.quaternion.slerpQuaternions(glideStart.quat, shotQuat, k)
              camera.fov = glideStart.fov + (shotFov() - glideStart.fov) * k
              camera.updateProjectionMatrix()
            } else if (elapsed >= BUILD) {
              camTarget.copy(fullCenter).addScaledVector(camDir, fitDistance(fullSize))
              camera.position.lerp(camTarget, damp)
              lookSmooth.lerp(fullCenter, damp)
              camera.lookAt(lookSmooth)
            } else {
              const index = Math.min(indexAt(elapsed + 900), groupEnd[indexAt(elapsed)])
              camTarget.copy(centers[index]).addScaledVector(camDir, fitDistance(sizes[index]))
              camera.position.lerp(camTarget, damp)
              lookSmooth.lerp(centers[index], damp)
              camera.lookAt(lookSmooth)
            }
            const dim = smooth(clamp01((elapsed - tDim) / DIM))
            ambient.intensity = 1.8 + (config.dim[0] - 1.8) * dim
            buildSun.intensity = 2.4 + (config.dim[1] - 2.4) * dim
            shotLights.forEach((light, i) => {
              light.intensity = light.userData.max * smooth(clamp01((elapsed - tLights - i * STAGGER) / RAMP))
            })
            if (elapsed >= tDone) {
              finished = true
              this.setShotCamera()
              controls.enabled = true
              canvas.style.cursor = "grab"
              renderImg.classList.add("visible")
              modelButtons.classList.remove("hidden")
            }
            renderer.render(scene, camera)
          }
        }
      }

      let activating = 0
      async function activate(index) {
        const config = SCENES[index]
        if (active?.config === config) return
        tabs.forEach((tab, i) => tab.classList.toggle("active", i === index))
        renderImg.classList.remove("visible")
        modelButtons.classList.add("hidden")
        const token = ++activating
        const gltf = await loadModel(config.model)
        if (token !== activating) return
        renderImg.src = config.render
        active = buildScene(config, gltf)
        active.restart()
      }

      function resize() {
        const width = modelContainer.clientWidth
        const height = modelContainer.clientHeight
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        active?.applyFov()
        camera.updateProjectionMatrix()
      }
      new ResizeObserver(resize).observe(modelContainer)

      let running = true
      let frame

      function animate(now) {
        frame = requestAnimationFrame(animate)
        active?.animate(now)
      }

      new IntersectionObserver(entries => {
        const visible = entries.some(e => e.isIntersecting)
        if (visible && !running) {
          running = true
          active?.resume()
          frame = requestAnimationFrame(animate)
        } else if (!visible && running) {
          running = false
          cancelAnimationFrame(frame)
        }
      }).observe(modelContainer)

      controls.addEventListener("start", () => renderImg.classList.remove("visible"))
      document.getElementById("model-reset").addEventListener("click", () => active?.resetShot())
      document.getElementById("model-replay").addEventListener("click", () => active?.restart())
      tabs.forEach((tab, i) => tab.addEventListener("click", () => activate(i)))

      document.getElementById("home-showcase").classList.remove("hidden")
      resize()
      await activate(0)
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
