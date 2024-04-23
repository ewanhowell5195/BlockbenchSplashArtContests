const register = document.getElementById("register")
let processing
if (register) {
  register.addEventListener("click", async e => {
    if (processing) return
    processing = true
    await fetch("/api/artists/register", { method: "POST" })
    location.reload()
  })
} else {
  const urlTest = /^https?:\/\/(?:[-a-z0-9@:%._\+~#=]{1,256}\.[a-z0-9()]{1,6}\b|\[[:0-9]{2,}\])([-a-z0-9()@:%_\+.~#?&\/=]*)$/i
  const displayName = document.getElementById("display-name")
  const socialMedia = document.getElementById("social-media")
  const saveChanges = document.getElementById("save-changes")
  const visualAccountName = document.querySelector("#account-header h1")
  const visualDisplayName = document.querySelector("#account-header h2")

  function change() {
    if (displayName.value.trim() !== displayName.dataset.original || socialMedia.value.trim() !== socialMedia.dataset.original) {
      saveChanges.disabled = false
    } else {
      saveChanges.disabled = true
    }
  }

  displayName.addEventListener("input", change)
  socialMedia.addEventListener("input", change)

  saveChanges.addEventListener("click", async e => {
    if (processing) return
    if (displayName.value.trim().length < 2) return shakeError(displayName, "Display Name too short")
    if (!urlTest.test(socialMedia.value.trim())) return shakeError(socialMedia, "Invalid Social Media URL")
    processing = true
    const r = await fetch("/api/artists/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: displayName.value.trim(),
        socialMedia: socialMedia.value.trim() || undefined
      })
    })
    if (!r.ok) {
      showNotification(`API Error: ${r.status}`)
      processing = false
      return
    }
    displayName.dataset.original = displayName.value.trim()
    socialMedia.dataset.original = socialMedia.value.trim()
    saveChanges.disabled = true
    if (visualAccountName.textContent === displayName.dataset.original) {
      visualDisplayName.hidden = true
    } else {
      visualDisplayName.textContent = displayName.dataset.original
      visualDisplayName.hidden = false
    }
    showNotification("Account details saved!")
    processing = false
  })
}