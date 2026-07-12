const output = document.getElementById("output")
const input = document.getElementById("command")
const form = document.getElementById("terminal-form")
const prompt = document.getElementById("prompt")

let cwd = ""
let running = false
const history = []
let historyIndex = -1

function append(text, cls) {
  if (text === "" || text == null) return
  const div = document.createElement("div")
  if (cls) div.className = cls
  div.textContent = text.replace(/\n$/, "")
  output.appendChild(div)
  output.scrollTop = output.scrollHeight
}

function setCwd(dir) {
  cwd = dir ?? ""
  prompt.textContent = (cwd || "") + " $"
}

async function submit(command, echo = true) {
  if (running || !command.trim()) return
  history.unshift(command)
  historyIndex = -1
  if (echo) append(`${cwd || "$"} $ ${command}`, "prompt-line")
  running = true
  input.disabled = true
  try {
    const r = await fetch("/api/admin/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, cwd })
    })
    if (r.ok) {
      const data = await r.json()
      append(data.output, "stdout")
      append(data.stderr, "stderr")
      if (data.timedOut) append("[timed out after 120s]", "stderr")
      else if (data.code) append(`[exit ${data.code}]`, "exit")
      setCwd(data.cwd)
    } else if ([502, 503, 504, 520, 521, 522, 523, 524].includes(r.status)) {
      append(`No response (${r.status}, the server may be restarting)`, "exit")
    } else {
      append(`Request failed: ${r.status} ${r.statusText}`, "stderr")
    }
  } catch (err) {
    append(`No response (the server may be restarting)`, "exit")
  }
  running = false
  input.disabled = false
  input.focus()
}

form.addEventListener("submit", e => {
  e.preventDefault()
  const command = input.value
  input.value = ""
  submit(command)
})

for (const btn of document.querySelectorAll(".term-btn[data-command]")) {
  btn.addEventListener("click", () => {
    if (btn.dataset.confirm && !confirm(btn.dataset.confirm)) return
    submit(btn.dataset.command)
  })
}

document.getElementById("clear-btn").addEventListener("click", () => {
  output.replaceChildren()
  input.focus()
})

input.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") {
    if (historyIndex < history.length - 1) {
      historyIndex++
      input.value = history[historyIndex]
      e.preventDefault()
    }
  } else if (e.key === "ArrowDown") {
    if (historyIndex > 0) {
      historyIndex--
      input.value = history[historyIndex]
    } else {
      historyIndex = -1
      input.value = ""
    }
    e.preventDefault()
  }
})

submit("true", false)
