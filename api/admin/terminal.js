import { exec } from "node:child_process"

const shell = process.env.TERMINAL_SHELL || (process.platform === "win32" ? "C:/Program Files/Git/bin/bash.exe" : "/bin/bash")

const delim = "__TERMINAL_META_9f3a5c__"

function shellQuote(s) {
  return "'" + s.replace(/'/g, "'\\''") + "'"
}

export default {
  post: {
    admin: true,
    arguments: {
      command: {
        required: true
      },
      cwd: {}
    },
    execute(req, res) {
      const command = req.body.command
      const cwd = req.body.cwd
      const cd = cwd ? `cd ${shellQuote(cwd)} 2>/dev/null\n` : ""
      const wrapped = `${cd}{ ${command}\n}\n__ec=$?\nprintf '%s%s\\n%s' "${delim}" "$__ec" "$(pwd)"`
      exec(wrapped, {
        shell,
        timeout: 120000,
        maxBuffer: 10 * 1024 * 1024,
        env: process.env
      }, (err, stdout, stderr) => {
        let output = stdout ?? ""
        let code = typeof err?.code === "number" ? err.code : 0
        let timedOut = false
        let newCwd = cwd ?? ""

        const idx = output.lastIndexOf(delim)
        if (idx !== -1) {
          const meta = output.slice(idx + delim.length)
          output = output.slice(0, idx)
          const nl = meta.indexOf("\n")
          const parsed = parseInt(meta.slice(0, nl))
          if (!isNaN(parsed)) code = parsed
          const reported = meta.slice(nl + 1).trim()
          if (reported) newCwd = reported
        } else if (err?.killed) {
          timedOut = true
        }

        res.send({
          output,
          stderr: stderr ?? "",
          code,
          cwd: newCwd,
          timedOut
        })
      })
    }
  }
}
