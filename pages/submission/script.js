const input = document.querySelector("file-input")
if (input) {
  let processing
  const prefix = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const maxFileSize = Number(input.dataset.maxfilesize)
  const aspectRatio = input.dataset.aspectratio.split(":").map(e => Number(e))
  const minWidth = Number(input.dataset.minwidth)
  const maxWidth = Number(input.dataset.maxwidth)
  document.getElementById("submit").addEventListener("click", async e => {
    if (processing) return
    if (!input.files[0]) {
      return shakeError(input, "Please provide a submission file")
    }
    if (input.files[0].size > maxFileSize) {
      return shakeError(input, `File size too large. The maximum file size is ${maxFileSize / 1024 / 1024} MB`)
    }
    processing = true
    let url
    try {
      const buffer = await new Promise((fulfil, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.readyState === FileReader.DONE) {
            return fulfil(new Uint8Array(reader.result))
          }
          reject()
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(input.files[0])
      })
      if (!buffer.slice(0, prefix.length).every((b, i) => b === prefix[i])) {
        processing = false
        return shakeError(input, "The provided file was not a PNG file")
      }
      url = URL.createObjectURL(new Blob([buffer]))
      const img = new Image()
      img.src = url
      await img.decode()
      URL.revokeObjectURL(url)
      if (img.width < minWidth) {
        processing = false
        return shakeError(input, `Image too small. The minimum width is ${minWidth}px`)
      }
      if (img.width > maxWidth) {
        processing = false
        return shakeError(input, `Image too large. The maximum width is ${maxWidth}px`)
      }
      const targetRatio = aspectRatio[0] / aspectRatio[1]
      const imgRatio = img.width / img.height
      if (Math.abs(targetRatio - imgRatio) > 0.005) {
        processing = false
        return shakeError(input, `Aspect ratio not met. The aspect ratio should be ${aspectRatio.join(":")}`)
      }
    } catch (err) {
      URL.revokeObjectURL(url)
      processing = false
      return shakeError(input, "Unable to load image file")
    }
    const formData = new FormData()
    formData.append("submission", input.files[0])
    const r = await fetch("/api/submission", {
      method: "POST",
      body: formData
    })
    if (!r.ok) {
      processing = false
      if (r.status === 429) return showNotification("Uploading too fast, try again in a couple seconds")
      return shakeError(input, (await r.json()).error)
    }
    location.reload()
  })
} else {
  document.getElementById("retract")?.addEventListener("click", async e => {
    if (confirm("Are you sure you want to retract your submission?")) {
      await fetch("/api/submission", {
        method: "DELETE"
      })
    location.reload()
    }
  })
}