const register = document.getElementById("register")
let processing
if (register) {
  register.addEventListener("click", async e => {
    if (processing) return
    processing = true
    const r = await fetch("/api/artists/register", { method: "POST" })
    if (!r.ok) {
      processing = false
      return showAPIError(r)
    }
    location.reload()
  })
} else {
  const urlTest = /^https?:\/\/(?:[-a-z0-9@:%._\+~#=]{1,256}\.[a-z0-9()]{1,6}\b|\[[:0-9]{2,}\])([-a-z0-9()@:%_\+.~#?&\/=]*)$/i
  const avatarPreview = document.getElementById("avatar-preview")
  const avatarImage = avatarPreview.querySelector("img")
  const uploadAvatar = document.getElementById("upload-avatar")
  const removeAvatar = document.getElementById("remove-avatar")
  const avatarFile = document.getElementById("avatar-file")
  const maxFileSize = Number(uploadAvatar.dataset.maxFileSize)

  uploadAvatar.addEventListener("click", e => {
    if (processing) return
    avatarFile.value = ""
    avatarFile.click()
  })

  avatarFile.addEventListener("change", async e => {
    if (processing || !avatarFile.files[0]) return
    const file = avatarFile.files[0]
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      return shakeError(uploadAvatar, "The provided file was not a PNG, JPEG, or WebP file")
    }
    if (file.size > maxFileSize) {
      return shakeError(uploadAvatar, `File size too large. The maximum file size is ${maxFileSize / 1024 / 1024} MB`)
    }
    processing = true
    uploadAvatar.classList.add("loading")
    let url
    try {
      url = URL.createObjectURL(file)
      const img = new Image()
      img.src = url
      await img.decode()
      URL.revokeObjectURL(url)
      if (Math.min(img.width, img.height) < 64) {
        processing = false
        uploadAvatar.classList.remove("loading")
        return shakeError(uploadAvatar, "Image too small. The minimum size is 64x64")
      }
      if (Math.max(img.width, img.height) > 8192) {
        processing = false
        uploadAvatar.classList.remove("loading")
        return shakeError(uploadAvatar, "Image too large. The maximum size is 8192x8192")
      }
    } catch (err) {
      URL.revokeObjectURL(url)
      processing = false
      uploadAvatar.classList.remove("loading")
      return shakeError(uploadAvatar, "Unable to load image file")
    }
    const formData = new FormData()
    formData.append("avatar", file)
    const r = await fetch("/api/artists/avatar", {
      method: "POST",
      body: formData
    })
    uploadAvatar.classList.remove("loading")
    processing = false
    if (!r.ok) {
      uploadAvatar.classList.add("shake-error")
      setTimeout(() => uploadAvatar.classList.remove("shake-error"), 500)
      return showAPIError(r)
    }
    avatarImage.src = await r.text() + "?t=" + Date.now()
    removeAvatar.disabled = false
    showNotification("Avatar updated!")
  })

  const syncAvatar = document.getElementById("sync-avatar")
  syncAvatar.addEventListener("click", async e => {
    if (processing) return
    processing = true
    syncAvatar.classList.add("loading")
    const r = await fetch("/api/artists/avatar/discord", { method: "POST" })
    syncAvatar.classList.remove("loading")
    processing = false
    if (!r.ok) return showAPIError(r)
    avatarImage.src = await r.text() + "?t=" + Date.now()
    removeAvatar.disabled = false
    showNotification("Avatar synced from Discord!")
  })

  removeAvatar.addEventListener("click", async e => {
    if (processing) return
    processing = true
    removeAvatar.classList.add("loading")
    const r = await fetch("/api/artists/avatar", { method: "DELETE" })
    removeAvatar.classList.remove("loading")
    processing = false
    if (!r.ok) {
      showAPIError(r)
      return
    }
    avatarImage.src = "/assets/images/branding/default_avatar.webp"
    removeAvatar.disabled = true
    showNotification("Avatar removed!")
  })

  const displayName = document.getElementById("display-name")
  const socialMedia = document.getElementById("social-media")
  const bio = document.getElementById("bio")
  const saveChanges = document.getElementById("save-changes")
  const visualAccountName = document.querySelector("#account-header h1")
  const visualDisplayName = document.querySelector("#account-header h2")

  function change() {
    if (
      displayName.value.trim() !== displayName.dataset.original ||
      socialMedia.value.trim() !== socialMedia.dataset.original ||
      bio.value.trim() !== bio.dataset.original
    ) {
      saveChanges.disabled = false
    } else {
      saveChanges.disabled = true
    }
  }

  displayName.addEventListener("input", change)
  socialMedia.addEventListener("input", change)
  bio.addEventListener("input", change)

  saveChanges.addEventListener("click", async e => {
    if (processing) return
    if (displayName.value.trim().length < 2) return shakeError(displayName, "Display Name too short")
    if (socialMedia.value.trim() && !urlTest.test(socialMedia.value.trim())) return shakeError(socialMedia, "Invalid Social Media URL")
    processing = true
    const r = await fetch("/api/artists/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: displayName.value.trim(),
        socialMedia: socialMedia.value.trim() || undefined,
        bio: bio.value.trim() || undefined
      })
    })
    if (!r.ok) {
      showAPIError(r)
      processing = false
      return
    }
    displayName.dataset.original = displayName.value.trim()
    socialMedia.dataset.original = socialMedia.value.trim()
    bio.dataset.original = bio.value.trim()
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

  document.querySelectorAll(".featured-option").forEach(option => option.addEventListener("click", async e => {
    if (processing) return
    processing = true
    const selected = option.classList.contains("selected")
    const r = await fetch("/api/artists/featured", selected ? {
      method: "DELETE"
    } : {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: option.dataset.image })
    })
    processing = false
    if (!r.ok) {
      showAPIError(r)
      return
    }
    document.querySelectorAll(".featured-option.selected").forEach(o => o.classList.remove("selected"))
    if (!selected) option.classList.add("selected")
    showNotification(selected ? "Featured submission cleared!" : "Featured submission saved!")
  }))
}