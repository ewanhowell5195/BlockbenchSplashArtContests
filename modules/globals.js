import child_process from "node:child_process"

globalThis.pngPrefix = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

globalThis.spawn = (exe, args, data = { stdio: "ignore" }) => {
  const p = child_process.spawn(exe, args, data)
  p.promise = new Promise((fulfil, reject) => {
    p.on("close", () => {
      fulfil()
      clearTimeout(timeout)
    })
    p.on("error", () => {
      reject()
      clearTimeout(timeout)
    })
    const timeout = setTimeout(() => p.kill(), 1000)
  })
  return p
}