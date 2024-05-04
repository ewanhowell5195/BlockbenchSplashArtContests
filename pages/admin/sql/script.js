let running
const sql = document.getElementById("sql")
const outputPanel = document.getElementById("output-panel")
const output = document.getElementById("output")
document.getElementById("submit").addEventListener("click", async e => {
  if (running || !confirm("Are you sure you want to execute this SQL statement? Executing SQL statements could damage the database.")) return
  running = true
  const r = await fetch("/api/admin/sql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sql: sql.value
    })
  })
  outputPanel.classList.remove("hidden")
  if (r.status === 500) {
    output.textContent = `${new Date().toLocaleString()}\n\n${await r.text()}`
  } else {
    output.textContent = `${new Date().toLocaleString()}\n\n${JSON.stringify(await r.json(), null, 2)}`
  }
  running = false
})