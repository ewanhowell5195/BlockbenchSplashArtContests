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
      progress.style.transition = null
      progress.style.right = 0
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
  progress.style.right = 0
  timeout = setTimeout(() => next(), 8000)
}