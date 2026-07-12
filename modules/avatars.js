globalThis.avatars = {
  async convert(buffer, id) {
    try {
      await fs.promises.mkdir("assets/images/avatars", { recursive: true })
      const p = spawn("ffmpeg", ["-y", "-i", "-", "-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=256:256:flags=full_chroma_int", "-q:v", "95", `assets/images/avatars/${id}.webp`], { stdio: ["pipe", "ignore", "ignore"] })
      p.stdin.on("error", () => {})
      p.stdin.write(buffer)
      p.stdin.end()
      await p.promise
      if (!fs.existsSync(`assets/images/avatars/${id}.webp`)) return false
      db.artists.setAvatar(id, true)
      return true
    } catch {
      return false
    }
  },
  async download(user) {
    if (!user.avatarID) return false
    try {
      const r = await fetch(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatarID}.png?size=512`)
      if (!r.ok) return false
      return await avatars.convert(Buffer.from(await r.arrayBuffer()), user.id)
    } catch {
      return false
    }
  },
  async remove(id) {
    await fs.promises.unlink(`assets/images/avatars/${id}.webp`).catch(() => {})
    db.artists.setAvatar(id, false)
  },
  url: id => `/assets/images/avatars/${id}.webp`
}

{
  let files = []
  try {
    files = fs.readdirSync("assets/images/avatars")
  } catch {}
  const fileIds = files.filter(f => f.endsWith(".webp")).map(f => f.slice(0, -5))
  for (const id of db.artists.reconcileAvatars(fileIds)) {
    fs.rmSync(`assets/images/avatars/${id}.webp`, { force: true })
  }
}