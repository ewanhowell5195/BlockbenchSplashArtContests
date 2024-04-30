// Popups

const getPopupable = () => Array.from(document.querySelectorAll(".popupable")).filter(e => {
  while (e) {
    const style = window.getComputedStyle(e)
    if (style.display === "none") return false
    e = e.parentElement
  }
  return true
})

document.addEventListener("click", e => {
  let element = e.target
  while (element && !element.classList.contains("popupable")) {
    if (["BUTTON", "A"].includes(element.tagName)) return
    element = element.parentElement
  }
  if (element) {
    function nextImage() {
      const all = getPopupable()
      const next = all[all.indexOf(element) + 1]
      if (next) {
        element = next
        loadImage(img, element)
      }
    }

    function prevImage() {
      const all = getPopupable()
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
        <a id="popup-image-open" class="icon" target="_blank">open_in_new</a>
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
})

function loadImage(img, element) {
  const all = getPopupable()
  const index = all.indexOf(element)
  const openImage = img.parentNode.querySelector("#popup-image-open")
  const prevIcon = img.parentNode.querySelector("#popup-image-prev")
  const nextIcon = img.parentNode.querySelector("#popup-image-next")
  
  const url = element.dataset.popupSrc ?? element.getAttribute("src")
  img.src = url
  openImage.href = url

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

// Notifications

const notifications = document.getElementById("notification-container")
function showNotification(text) {
  const notification = document.createElement("div")
  notification.innerHTML = text
  notifications.prepend(notification)
  setTimeout(() => {
    notification.classList.add("notification-slide")
    setTimeout(() => {
      notification.classList.remove("notification-slide")
      setTimeout(() => {
        notification.remove()
      }, 500)
    }, 3500)
  }, 10)
}

// Shake Error

function shakeError(element, message) {
  element.classList.add("shake-error")
  setTimeout(() => element.classList.remove("shake-error"), 500)
  showNotification(message)
}