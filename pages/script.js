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