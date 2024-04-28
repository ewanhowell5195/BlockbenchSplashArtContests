const input = document.querySelector("file-input")
if (input) {
  const prefix = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const maxFileSize = Number(input.dataset.maxFileSize)
  const aspectRatio = input.dataset.aspectRatio.split(":").map(e => Number(e))
  const minWidth = Number(input.dataset.minWidth)
  const maxWidth = Number(input.dataset.maxWidth)
  const submit = document.getElementById("submit")
  submit.addEventListener("click", async e => {
    if (submit.classList.contains("loading")) return
    if (!input.files[0]) {
      return shakeError(input, "Please provide a submission file")
    }
    if (input.files[0].size > maxFileSize) {
      return shakeError(input, `File size too large. The maximum file size is ${maxFileSize / 1024 / 1024} MB`)
    }
    submit.classList.add("loading")
    let url
    try {
      const buffer = await new Promise((fulfil, reject) => {
        const reader = new FileReader()
        reader.onload = e => fulfil(new Uint8Array(reader.result))
        reader.onerror = reject
        reader.readAsArrayBuffer(input.files[0])
      })
      if (!buffer.slice(0, prefix.length).every((b, i) => b === prefix[i])) {
        submit.classList.remove("loading")
        return shakeError(input, "The provided file was not a PNG file")
      }
      url = URL.createObjectURL(new Blob([buffer]))
      const img = new Image()
      img.src = url
      await img.decode()
      URL.revokeObjectURL(url)
      if (img.width < minWidth) {
        submit.classList.remove("loading")
        return shakeError(input, `Image too small. The minimum width is ${minWidth.toLocaleString()}px`)
      }
      if (img.width > maxWidth) {
        submit.classList.remove("loading")
        return shakeError(input, `Image too large. The maximum width is ${maxWidth.toLocaleString()}px`)
      }
      const targetRatio = aspectRatio[0] / aspectRatio[1]
      const imgRatio = img.width / img.height
      if (Math.abs(targetRatio - imgRatio) > 0.04) {
        submit.classList.remove("loading")
        return shakeError(input, `Aspect ratio not met. The aspect ratio should be ${aspectRatio.join(":")}`)
      }
    } catch (err) {
      URL.revokeObjectURL(url)
      submit.classList.remove("loading")
      return shakeError(input, "Unable to load image file")
    }
    const formData = new FormData()
    formData.append("submission", input.files[0])
    const r = await fetch("/api/submission", {
      method: "POST",
      body: formData
    })
    if (!r.ok) {
      submit.classList.remove("loading")
      processing = false
      if (r.status === 429) return showNotification("Uploading too fast, try again in a couple seconds")
      return shakeError(input, (await r.json()).error)
    }
    location.reload()
  })
} else {
  let processing
  const inviteButton = document.getElementById("invite")
  if (inviteButton) {
    const deleteInvite = document.getElementById("delete-invite")
    let processing
    inviteButton.addEventListener("click", async e => {
      if (processing) return
      processing = true
      if (!inviteButton.dataset.invite) {
        const r = await fetch("/api/invite", {
          method: "POST"
        })
        if (!r.ok) {
          processing = false
          return showNotification("Failed to generate invite link")
        }
        inviteButton.dataset.invite = await r.text()
      }
      inviteButton.textContent = "Copied!"
      navigator.clipboard.writeText(`${location.origin}/api/invite/${inviteButton.dataset.invite}`)
      deleteInvite.classList.remove("hidden")
      setTimeout(() => {
        inviteButton.innerHTML = `<span class="icon">link</span> Copy Invite Link`
        processing = false
      }, 2000)
    })
    deleteInvite.addEventListener("click", async e => {
      if (processing) return
      processing = true
      delete inviteButton.dataset.invite
      await fetch("/api/invite", {
        method: "DELETE"
      })
      deleteInvite.classList.add("hidden")
      inviteButton.innerHTML = `<span class="icon">person_add</span> Generate Invite Link`
      processing = false
    })
  }
  document.querySelectorAll(".remove-collaborator").forEach(e => e.addEventListener("click", async evt => {
    if (processing) return
    processing = true
    if (confirm(`Are you sure you want to remove ${e.previousElementSibling.previousElementSibling.textContent} from being a collaborator?`)) {
      await fetch("/api/collaborator/" + e.dataset.id, {
        method: "DELETE"
      })
      location.reload()
    }
    processing = false
  }))
  document.getElementById("retract")?.addEventListener("click", async e => {
    if (processing) return
    processing = true
    if (confirm("Are you sure you want to retract your submission?")) {
      await fetch("/api/submission", {
        method: "DELETE"
      })
      location.reload()
    }
    processing = false
  })
  const leave = document.getElementById("leave")
  leave?.addEventListener("click", async e => {
    if (processing) return
    processing = true
    if (confirm("Are you sure you want to leave the submission?")) {
      await fetch("/api/collaborator/" + leave.dataset.id, {
        method: "DELETE"
      })
      location.reload()
    }
    processing = false
  })
}