import child_process from "node:child_process"

const prefix = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

export default {
  post: {
    ratelimit: 1,
    check(req, res, next) {
      const contest = db.contests.latest()
      if (contest.status !== "submissions") return res.sendStatus(403)
      if (db.artists.submission(contest.id, req.user.id)) return res.sendStatus(409)
      next()
    },
    upload: {
      field: "submission",
      filter: (req, file, next) => {
        if (file.mimetype === "image/png") {
          next(null, true)
        } else {
          req.error = "The provided file was not a PNG file"
          next(null, false)
        }
      }
    },
    async execute(req, res) {
      if (!req.file.buffer.slice(0, prefix.length).equals(prefix)) {
        return res.status(400).send({ error: "The provided file was not a PNG file" })
      }
      const p = spawn("ffprobe", ["-v", "quiet", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", "-"], { stdio: ["pipe", "pipe", "ignore"] })
      p.stdin.write(req.file.buffer)
      p.stdin.end()
      let arr = []
      for await (const part of p.stdout) {
        arr.push(part)
      } 
      const size = Buffer.concat(arr).toString().split(",").map(e => Number(e))
      if (size.length !== 2 || size.some(e => isNaN(e))) {
        return res.status(400).send({ error: "Error reading PNG file" })
      }
      if (size[0] < settings.minWidth) {
        return res.status(400).send({ error: `Image too small. The minimum width is ${settings.minWidth}px` })
      }
      if (size[0] > settings.maxWidth) {
        return res.status(400).send({ error: `Image too large. The maximum width is ${settings.maxWidth}px` })
      }
      const targetRatio = settings.aspectRatio[0] / settings.aspectRatio[1]
      const imgRatio = size[0] / size[1]
      if (Math.abs(targetRatio - imgRatio) > 0.005) {
        return res.status(400).send({ error: `Aspect ratio not met. The aspect ratio should be ${settings.aspectRatio.join(":")}` })
      }
      db.artists.add(req.user.id, req.user.global_name, null)
      const contest = db.contests.latest()
      const folder = "assets/images/submissions/" + contest.id
      await fs.promises.mkdir(folder, { recursive: true })
      const hash = createHash("sha256")
      hash.update(req.file.buffer)
      const hex = hash.digest("hex")
      db.submissions.add(contest.id, [req.user.id], hex)
      await fs.promises.writeFile(`${folder}/${hex}.png`, req.file.buffer)
      res.sendStatus(200)
    }
  },
  delete: {
    check(req, res, next) {
      const contest = db.contests.latest()
      if (contest.status !== "submissions") return res.sendStatus(403)
      if (!db.artists.submission(contest.id, req.user.id)) return res.sendStatus(404)
      next()
    },
    execute(req, res) {
      const contest = db.contests.latest()
      const submission = db.artists.submission(contest.id, req.user.id)
      fs.promises.unlink(`assets/images/submissions/${contest.id}/${submission.image}.png`).catch(() => {})
      db.submissions.delete(submission.id, submission.contest)
      res.sendStatus(200)
    }
  }
}

function spawn(exe, args, data = { stdio: "ignore" }) {
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