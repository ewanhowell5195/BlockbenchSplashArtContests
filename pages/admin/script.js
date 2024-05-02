const progress = document.getElementById("progress")
let processing
if (progress) {
  progress.addEventListener("click", async e => {
    if (processing) return
    if (confirm(document.getElementById("contest-status").textContent === "Voting" ? "Are you sure you want to finish the current contest? This action cannot be undone." : "Are you sure you want to progress the contest on to the next stage?")) {
      processing = true
      await fetch("/api/admin/contest/progress", { method: "PATCH" })
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
}