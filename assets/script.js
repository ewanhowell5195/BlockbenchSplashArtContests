function disableScroll(e) {
  e.preventDefault()
}

document.addEventListener("click", e => {
  let element = e.target
  while (element && !element.classList.contains("popupable")) {
    if (["BUTTON", "A"].includes(element.tagName)) return
    element = element.parentElement
  }
  if (element) {
    document.addEventListener("wheel", disableScroll, { passive: false })
    document.addEventListener("touchmove", disableScroll, { passive: false })

    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
      <div class="popup-container">
        <img class="popup-image">
        <div id="popup-image-close" class="icon">close</div>
        <div id="popup-image-prev" class="icon">chevron_left</div>
        <div id="popup-image-next" class="icon">chevron_right</div>
      </div>
    `

    const img = popup.querySelector(".popup-image")

    function close()  {
      popup.remove()
      document.removeEventListener("wheel", disableScroll, { passive: false })
      document.removeEventListener("touchmove", disableScroll, { passive: false })
    }

    popup.querySelector("#popup-image-close").addEventListener("click", close)
    popup.addEventListener("click", e => {
      if (e.target === popup) {
        close()
      }
    })

    popup.querySelector("#popup-image-prev").addEventListener("click", e => {
      const all = Array.from(document.querySelectorAll(".popupable"))
      element = all[all.indexOf(element) - 1]
      loadImage(img, element)
    })

    popup.querySelector("#popup-image-next").addEventListener("click", () => {
      const all = Array.from(document.querySelectorAll(".popupable"))
      element = all[all.indexOf(element) + 1]
      loadImage(img, element)
    })

    document.body.append(popup)
    loadImage(img, element)
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
