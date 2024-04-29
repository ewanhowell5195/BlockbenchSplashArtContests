const submissions = document.getElementById("submissions")
if (submissions) {
  const images = shuffle(Array.from(submissions.content.children).map(e => ({ id: e.dataset.id, src: e.src })))
  const preview = document.getElementById("submission-preview")
  document.getElementById("start").addEventListener("click", e => {
    document.getElementById("vote-start").classList.add("hidden")
    let currentIndex = 13
    const back = preview.querySelector("button:first-child")
    const next = preview.querySelector("button:last-child")
    const img = preview.querySelector("img")
    const spinner = preview.querySelector("svg")
    const progress = document.getElementById("submission-progress")
    let loading
    let first = true
    function showPreviewImage() {
      loading = true
      if (!first) preview.classList.add("loading-fade")
      setTimeout(async () => {
        if (currentIndex === images.length) {
          loadVoting()
        } else {
          first = false
          img.src = images[currentIndex].src
          preview.style.backgroundImage = `linear-gradient(#000C, #000C), url('${img.src}')`
          const timeout = setTimeout(() => spinner.classList.add("visible"), 500)
          await img.decode()
          if (currentIndex <= 0) {
            back.classList.add("hidden")
          } else {
            back.classList.remove("hidden")
          }
          if (currentIndex >= images.length - 1) {
            next.textContent = "Vote"
          } else {
            next.textContent = "Next"
          }
          progress.textContent = currentIndex + 1
          clearTimeout(timeout)
          spinner.classList.remove("visible")
          preview.classList.remove("loading-fade")
          setTimeout(() => loading = false, 500)
        }
      }, first ? 0 : 500)
    }
    back.addEventListener("click", e => {
      if (loading) return
      currentIndex--
      showPreviewImage()
    })
    next.addEventListener("click", e => {
      if (loading) return
      currentIndex++
      showPreviewImage()
    })
    showPreviewImage()
    preview.classList.remove("hidden")
  })
  function loadVoting() {
    preview.classList.add("hidden")
    document.getElementById("submission-voting").classList.remove("hidden")
    const list = document.getElementById("submission-list")
    for (const [i, image] of images.entries()) {
      const div = document.createElement("div")
      div.className = "panel"
      div.draggable = true
      div.innerHTML = `
        <div>#${i + 1}</div>
        <img src="${image.src}" class="popupable"></div>
        <div class="spacer"></div>
        <div>
          <div class="move-up icon">expand_less</div>
          <div class="move-down icon">expand_more</div>
        </div>
      `
      list.prepend(div)
    }
    function position() {
      let top = 0
      for (const [i, child] of Array.from(list.children).reverse().entries()) {
        child.style.top = top + "px"
        child.children[0].textContent = "#" + (i + 1)
        top += child.clientHeight + 20
      }
      list.style.height = top + "px"
    }
    window.addEventListener("resize", position)
    list.querySelectorAll("img").forEach(e => e.addEventListener("load", position))
    list.querySelectorAll(".move-up").forEach(e => e.addEventListener("click", evt => {
      e.parentNode.parentNode.parentNode.insertBefore(e.parentNode.parentNode.nextElementSibling, e.parentNode.parentNode)
      position()
    }))
    list.querySelectorAll(".move-down").forEach(e => e.addEventListener("click", evt => {
      e.parentNode.parentNode.parentNode.insertBefore(e.parentNode.parentNode, e.parentNode.parentNode.previousElementSibling)
      position()
    }))
    let selected
    document.addEventListener("dragover", e => e.preventDefault())
    document.addEventListener("dragenter", e => e.preventDefault())
    list.querySelectorAll(".panel").forEach(e => {
      e.addEventListener("dragstart", evt => {
        const img = new Image()
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        event.dataTransfer.setDragImage(img, 0, 0)
        evt.dataTransfer.effectAllowed = "move"
        evt.dataTransfer.setData("text/plain", null)
        selected = evt.currentTarget
        selected.classList.add("selected")
      })
      let processing
      e.addEventListener("dragover", evt => {
        if (processing) return
        evt.dataTransfer.dropEffect = "grabbing"
        if (isBefore(selected, evt.currentTarget)) {
          processing = true
          evt.currentTarget.parentNode.insertBefore(selected, evt.currentTarget)
          setTimeout(() => position(), 10)
          setTimeout(() => processing = false, 260)
        } else if (isBefore(evt.currentTarget, selected)) {
          processing = true
          evt.currentTarget.parentNode.insertBefore(selected, evt.currentTarget.nextSibling)
          setTimeout(() => position(), 10)
          setTimeout(() => processing = false, 260)
        }
      })
      e.addEventListener("dragend", evt => {
        selected.classList.remove("selected")
        selected = null
      })
    })
  }
  document.getElementById("vote-start").classList.add("hidden")
  loadVoting()
}

function shuffle(arr) {
  const out = []
  for (const item of arr.slice()) {
    const index = Math.floor(Math.random() * arr.length)
    out.push(arr[index])
    arr.splice(index, 1)
  }
  return out
}

function isBefore(el1, el2) {
  let cur
  if (el2.parentNode === el1.parentNode) {
    for (cur = el1.previousSibling; cur; cur = cur.previousSibling) {
      if (cur === el2) return true
    }
  }
  return false
}