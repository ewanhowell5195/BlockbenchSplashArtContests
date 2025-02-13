const progress = document.getElementById("progress")
let processing
if (progress) {
  progress.addEventListener("click", async e => {
    if (processing) return
    if (confirm(document.getElementById("contest-status").textContent === "Voting" ? "Are you sure you want to finish the current contest? This action cannot be undone." : "Are you sure you want to progress the contest on to the next stage?")) {
      processing = true
      const r = await fetch("/api/admin/contest/progress", { method: "PATCH" })
      if (r.status === 409) {
        processing = false
        return showNotification("Cannot progress a contest with no submissions")
      }
      location.reload()
    }
  })
  document.getElementById("regress")?.addEventListener("click", async e => {
    if (processing) return
    if (confirm("Are you sure you want to regress the contest back to the previous stage?")) {
      processing = true
      await fetch("/api/admin/contest/regress", { method: "PATCH" })
      location.reload()
    }
  })
} else {
  const submit = document.getElementById("submit")

  const fields = {
    theme: document.getElementById("theme"),
    version: document.getElementById("version"),
    update: document.getElementById("update"),
    description: document.getElementById("description")
  }

  const dateInputs = Array.from(document.querySelectorAll("#dates-container input"))
  const image = document.getElementById("image")

  function change() {
    const fieldsValid = Object.values(fields).filter(e => e.required).every(e => e.value.trim())
    const datesValid = dateInputs.every(e => !e.classList.contains("invalid"))
    if (fieldsValid && datesValid && image.files[0]) {
      submit.disabled = false
    } else {
      submit.disabled = true
    }
  }

  function validateDates() {
    const dates = dateInputs.map(el => el._flatpickr.selectedDates[0])
    dateInputs.forEach((el, i) => {
      if (dates.slice(0, i).some(d => d > dates[i])) {
        el.classList.add("invalid")
      } else {
        el.classList.remove("invalid")
      }
    })
    change()
  }

  function setup(selector, defaultDate) {
    flatpickr(selector, {
      enableTime: true,
      minDate: "today",
      defaultDate,
      dateFormat: "H:i d/m/Y",
      time_24hr: true,
      onChange: validateDates
    })
  }

  setup("#contest-date", new Date())
  setup("#contest-open", new Date(new Date().setDate(new Date().getDate() + 20)))
  setup("#contest-close", new Date(new Date().setDate(new Date().getDate() + 24)))
  setup("#contest-vote", new Date(new Date().setTime(new Date().getTime() + (24 * 24 + 1) * 60 * 60 * 1000)))
  setup("#contest-finish", new Date(new Date().setTime(new Date().getTime() + (25 * 24 + 1) * 60 * 60 * 1000)))

  for (const field of Object.values(fields)) {
    field.addEventListener("input", e => {
      if (field.required) {
        field.classList.toggle("invalid", !field.value.trim())
        change()
      }
    })
  }

  image.addEventListener("change", change)

  const prefix = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const maxFileSize = Number(image.dataset.maxFileSize)
  const minSize = 720
  const maxSize = 4096

  submit.addEventListener("click", async e => {
    if (submit.classList.contains("loading")) return
    if (image.files[0].size > maxFileSize) {
      return shakeError(image, `File size too large. The maximum file size is ${maxFileSize / 1024 / 1024} MB`)
    }
    submit.classList.add("loading")
    let url
    try {
      const buffer = await new Promise((fulfil, reject) => {
        const reader = new FileReader()
        reader.onload = e => fulfil(new Uint8Array(reader.result))
        reader.onerror = reject
        reader.readAsArrayBuffer(image.files[0])
      })
      if (!buffer.slice(0, prefix.length).every((b, i) => b === prefix[i])) {
        submit.classList.remove("loading")
        return shakeError(image, "The provided file was not a PNG file")
      }
      url = URL.createObjectURL(new Blob([buffer]))
      const img = new Image()
      img.src = url
      await img.decode()
      URL.revokeObjectURL(url)
      if (img.width < minSize || img.height < minSize) {
        submit.classList.remove("loading")
        return shakeError(image, `Image too small. The minimum size is ${minSize.toLocaleString()}x${minSize.toLocaleString()}px`)
      }
      if (img.width > maxSize || img.height > maxSize) {
        submit.classList.remove("loading")
        return shakeError(image, `Image too large. The maximum size is ${maxSize.toLocaleString()}x${maxSize.toLocaleString()}px`)
      }
      const formData = new FormData()
      for (const [key, field] of Object.entries(fields)) {
        formData.append(key, field.value.trim())
      }
      for (const date of dateInputs) {
        formData.append(date.id.slice(8), date._flatpickr.selectedDates[0].getTime())
      }
      formData.append("image", image.files[0])
      const r = await fetch("/api/admin/contest/new", {
        method: "POST",
        body: formData
      })
      if (!r.ok) {
        submit.classList.remove("loading")
        processing = false
        if (r.status === 429) return showNotification("Attempting to create too fast, try again in a couple seconds")
        return shakeError(image, (await r.json()).error)
      }
      location.reload()
    } catch (err) {
      URL.revokeObjectURL(url)
      submit.classList.remove("loading")
      return shakeError(image, "Unable to create contest")
    }
  })
}