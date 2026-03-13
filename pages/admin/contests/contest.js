const container = document.getElementById("submissions")

container.addEventListener("click", async e => {
  const button = e.target.closest(".delete-submission")
  if (!button) return
  if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) return
  const r = await fetch("/api/admin/submission/" + container.dataset.contest + "/" + button.dataset.id, {
    method: "DELETE"
  })
  if (r.ok) {
    button.closest(".panel").remove()
    showNotification("Submission deleted")
  } else {
    showNotification("Failed to delete submission")
  }
})
