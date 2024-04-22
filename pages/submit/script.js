const input = document.getElementById("submission")
if (input) {
  document.getElementById("submit").addEventListener("click", async e => {
    console.log(input.files)
    if (!input.files[0]) return
    const formData = new FormData()
    formData.append("submission", input.files[0])
    const r = await fetch("/api/submit", {
      method: "POST",
      body: formData
    })
    console.log(r.status)
  })
}