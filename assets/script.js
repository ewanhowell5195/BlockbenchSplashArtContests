document.addEventListener("click", e => {
  let element = e.target
  while (element && !element.classList.contains("popupable")) {
    if (["BUTTON", "A"].includes(element.tagName)) return
    element = element.parentElement
  }
  if (element) {
    function nextImage() {
      const all = Array.from(document.querySelectorAll(".popupable"))
      const next = all[all.indexOf(element) + 1]
      if (next) {
        element = next
        loadImage(img, element)
      }
    }

    function prevImage() {
      const all = Array.from(document.querySelectorAll(".popupable"))
      const prev = all[all.indexOf(element) - 1]
      if (prev) {
        element = prev
        loadImage(img, element)
      }
    }

    const popup = document.createElement("div")
    popup.className = "popup"
    popup.innerHTML = `
      <div class="popup-container">
        <img class="popup-image">
        <div id="popup-image-close" class="icon">close</div>
        <div id="popup-image-prev" class="icon">chevron_left</div>
        <div id="popup-image-next" class="icon">chevron_right</div>
      </div>
    `

    function close()  {
      document.removeEventListener("keydown", keyHandler)
      popup.classList.remove("popup-visible")
      setTimeout(() => popup.remove(), 200)
    }

    function keyHandler(evt) {
      if (evt.code === "ArrowLeft" || evt.code === "KeyA") prevImage()
      else if (evt.code === "ArrowRight" || evt.code === "KeyD") nextImage()
      else if (evt.code === "Escape") close()
    }

    document.addEventListener("keydown", keyHandler)

    const img = popup.querySelector(".popup-image")

    popup.querySelector("#popup-image-close").addEventListener("click", close)
    popup.addEventListener("click", e => {
      if (e.target === popup) close()
    })

    popup.querySelector("#popup-image-next").addEventListener("click", nextImage)
    popup.querySelector("#popup-image-prev").addEventListener("click", prevImage)

    document.body.append(popup)
    loadImage(img, element)
    setTimeout(() => popup.classList.add("popup-visible"), 0)
  }
});

function loadImage(img, element) {
  const url = element.getAttribute("src")

  img.src = url

  const all = Array.from(document.querySelectorAll(".popupable"))
  const index = all.indexOf(element)
  const prevIcon = img.parentNode.querySelector("#popup-image-prev")
  const nextIcon = img.parentNode.querySelector("#popup-image-next")

  if (index === 0) {
    prevIcon.classList.add("hidden")
  } else {
    prevIcon.classList.remove("hidden")
  }
  if (index === all.length - 1) {
    nextIcon.classList.add("hidden")
  } else {
    nextIcon.classList.remove("hidden")
  }
}
