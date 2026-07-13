const avatarDir = "assets/images/avatars"

globalThis.avatars = {
  async convert(buffer, id) {
    try {
      await fs.promises.mkdir(avatarDir, { recursive: true })
      const p = spawn("ffmpeg", ["-y", "-i", "-", "-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=256:256:flags=full_chroma_int", "-q:v", "95", "-f", "webp", "-"], { stdio: ["pipe", "pipe", "ignore"] })
      p.stdin.on("error", () => {})
      p.stdin.write(buffer)
      p.stdin.end()
      const chunks = []
      for await (const chunk of p.stdout) chunks.push(chunk)
      await p.promise
      const out = Buffer.concat(chunks)
      if (!out.length) return false
      const hash = createHash("sha256").update(out).digest("hex").slice(0, 16)
      await fs.promises.writeFile(`${avatarDir}/${id}_${hash}.webp`, out)
      await avatars.cleanup(id, hash)
      db.artists.setAvatar(id, hash)
      return hash
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
    await avatars.cleanup(id, null)
    db.artists.setAvatar(id, null)
  },
  async cleanup(id, keepHash) {
    const keep = keepHash == null ? null : `${id}_${keepHash}.webp`
    let files
    try {
      files = await fs.promises.readdir(avatarDir)
    } catch {
      return
    }
    for (const f of files) {
      if (!f.endsWith(".webp") || f === keep) continue
      const base = f.slice(0, -5)
      const u = base.indexOf("_")
      const fid = u === -1 ? base : base.slice(0, u)
      if (fid === id) {
        await fs.promises.unlink(`${avatarDir}/${f}`).catch(() => {})
      }
    }
  },
  url: (id, hash) => `/${avatarDir}/${id}_${hash}.webp`
}

{
  let files = []
  try {
    files = fs.readdirSync(avatarDir)
  } catch {}

  const byId = {}
  for (const f of files) {
    if (!f.endsWith(".webp")) continue
    const base = f.slice(0, -5)
    const u = base.indexOf("_")
    const id = u === -1 ? base : base.slice(0, u)
    const hash = u === -1 ? null : base.slice(u + 1)
    ;(byId[id] ??= []).push({ file: f, hash })
  }

  const fileMap = {}
  for (const [id, entries] of Object.entries(byId)) {
    let chosen = entries[0]
    if (entries.length > 1) {
      chosen = entries
        .map(e => ({ ...e, mtime: fs.statSync(`${avatarDir}/${e.file}`).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)[0]
    }

    let hash = chosen.hash
    if (!hash) {
      try {
        hash = createHash("sha256").update(fs.readFileSync(`${avatarDir}/${chosen.file}`)).digest("hex").slice(0, 16)
        fs.renameSync(`${avatarDir}/${chosen.file}`, `${avatarDir}/${id}_${hash}.webp`)
        chosen = { file: `${id}_${hash}.webp`, hash }
      } catch {
        continue
      }
    }

    for (const e of entries) {
      if (e.file !== chosen.file) fs.rmSync(`${avatarDir}/${e.file}`, { force: true })
    }
    fileMap[id] = hash
  }

  for (const id of db.artists.reconcileAvatars(fileMap)) {
    fs.rmSync(`${avatarDir}/${id}_${fileMap[id]}.webp`, { force: true })
  }
}
