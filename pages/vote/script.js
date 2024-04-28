const submissions = document.getElementById("submissions")
if (submissions) {
  document.getElementById("start").addEventListener("click", e => {
    document.getElementById("vote-start").classList.add("hidden")
    const images = shuffle(Array.from(submissions.content.children).map(e => ({ id: e.dataset.id, src: e.src })))
    let currentIndex = 0
    const preview = document.getElementById("submission-preview")
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