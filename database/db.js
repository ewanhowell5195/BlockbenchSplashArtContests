import child_process from "node:child_process"
import fsp from "node:fs/promises"
import schedule from "node-schedule"
import path from "node:path"

globalThis.prepareDBAction = (action, run = "run", input = null, output = null) => {
  const prep = database.prepare(action)
  if (output) return (...args) => {
    if (input) args = input(...args)
    return output(prep[run](...args))
  }
  else return (...args) => {
    if (input) args = input(...args)
    return prep[run](...args)
  }
}

database.pragma("journal_mode = WAL")

const backupDir = "/home/ubuntu/Backups/BlockbenchSplashArtContestsBackup"

const backupImages = [
  { src: "assets/images/submissions", dest: "submissions", keep: f => f.endsWith(".png") },
  { src: "assets/images/contests", dest: "contests", keep: f => f.endsWith(".png") },
  { src: "assets/images/avatars", dest: "avatars", keep: () => true }
]

const pad = t => t.toString().padStart(2, "0")

function git(...args) {
  return new Promise((resolve, reject) => {
    const p = child_process.spawn("git", args, { cwd: backupDir, stdio: "ignore" })
    p.on("error", reject)
    p.on("close", code => resolve(code))
  })
}

async function mirror(srcRoot, destRoot, keep) {
  try {
    await fsp.access(srcRoot)
  } catch {
    return
  }

  const wanted = new Set()

  async function copyTree(rel) {
    const entries = await fsp.readdir(path.join(srcRoot, rel), { withFileTypes: true })
    for (const entry of entries) {
      const childRel = path.join(rel, entry.name)
      if (entry.isDirectory()) {
        await copyTree(childRel)
      } else if (keep(entry.name)) {
        wanted.add(childRel)
        const src = path.join(srcRoot, childRel)
        const dest = path.join(destRoot, childRel)
        const [s, d] = await Promise.all([
          fsp.stat(src),
          fsp.stat(dest).catch(() => null)
        ])
        if (!d || d.size !== s.size || d.mtimeMs < s.mtimeMs) {
          await fsp.mkdir(path.dirname(dest), { recursive: true })
          await fsp.copyFile(src, dest)
        }
      }
    }
  }

  async function pruneTree(rel) {
    let entries
    try {
      entries = await fsp.readdir(path.join(destRoot, rel), { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const childRel = path.join(rel, entry.name)
      if (entry.isDirectory()) {
        await pruneTree(childRel)
        if ((await fsp.readdir(path.join(destRoot, childRel))).length === 0) {
          await fsp.rmdir(path.join(destRoot, childRel))
        }
      } else if (!wanted.has(childRel)) {
        await fsp.rm(path.join(destRoot, childRel))
      }
    }
  }

  await fsp.mkdir(destRoot, { recursive: true })
  await copyTree("")
  await pruneTree("")
}

async function backup() {
  await database.backup(path.join(backupDir, "database.db"))
  for (const { src, dest, keep } of backupImages) {
    await mirror(src, path.join(backupDir, dest), keep)
  }
  await git("add", "-A")
  if (!await git("diff", "--cached", "--quiet")) return
  const d = new Date()
  const stamp = `${d.getUTCFullYear()}/${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  await git("commit", "-m", `Backup ${stamp}`)
  await git("push")
}

if (!process.argv.includes("-dev")) schedule.scheduleJob("0 3 * * *", backup)

export default {
  events: (await import("./sql/events.js")).default,
  artists: (await import("./sql/artists.js")).default,
  contests: (await import("./sql/contests.js")).default,
  submissions: (await import("./sql/submissions.js")).default
}