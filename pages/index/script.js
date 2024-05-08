const backgrounds = document.getElementById("home-background-container")
if (backgrounds.children.length > 1) {
  const progress = document.getElementById("progress-bar")
  const contents = document.getElementById("home-content-container")
  let timeout, processing
  function next() {
    if (processing) return
    processing = true
    clearTimeout(timeout)
    progress.style.transition = "initial"
    progress.style.right = "118px"
    setTimeout(() => {
      progress.style.transition = null
      const currentBackground = backgrounds.children[0]
      const nextBackground = backgrounds.children[1]
      const currentContent = contents.children[1]
      const nextContent = contents.children[2]
      currentBackground.classList.add("leave")
      currentContent.classList.add("leave")
      setTimeout(() => {
        currentBackground.classList.remove("leave")
        currentBackground.classList.add("enter")
        backgrounds.append(currentBackground)
        currentContent.classList.remove("leave")
        currentContent.classList.add("enter")
        contents.append(currentContent)
        processing = false
      }, 500)
      nextBackground.classList.remove("enter")
      nextContent.classList.remove("enter")
      progress.style.right = 0
      timeout = setTimeout(next, 8000)
    }, 2)
  }
  progress.style.right = 0
  setTimeout(next, 8000)
}