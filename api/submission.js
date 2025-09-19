export default {
  post: {
    ratelimit: 1,
    check(req, res, next) {
      const contest = db.contests.latest()
      if (contest.status !== "submissions") return res.sendStatus(403)
      if (db.submissions.artist.get(contest.id, req.user.id)) return res.sendStatus(409)
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
    arguments: {
      optional: {
        type: "boolean"
      }
    },
    async execute(req, res) {
      if (!req.file.buffer.slice(0, pngPrefix.length).equals(pngPrefix)) {
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
        return res.status(400).send({ error: `Image too small. The minimum width is ${settings.minWidth.toLocaleString()}px` })
      }
      if (size[0] > settings.maxWidth) {
        return res.status(400).send({ error: `Image too large. The maximum width is ${settings.maxWidth.toLocaleString()}px` })
      }
      const targetRatio = settings.aspectRatio[0] / settings.aspectRatio[1]
      const imgRatio = size[0] / size[1]
      if (Math.abs(targetRatio - imgRatio) > 0.04) {
        return res.status(400).send({ error: `Aspect ratio not met. The aspect ratio should be ${settings.aspectRatio.join(":")}` })
      }
      db.artists.add(req.user.id, req.user.global_name ?? req.user.username, null)
      const contest = db.contests.latest()
      const folder = "assets/images/submissions/" + contest.id
      await fs.promises.mkdir(folder, { recursive: true })
      const hash = createHash("sha256")
      hash.update(req.file.buffer)
      const hex = hash.digest("hex")
      try {
        await fs.promises.access(`${folder}/${hex}.png`, fs.constants.F_OK)
        return res.status(400).send({ error: `Already submit by another artist. If you are working with them, ask them to send you an invite link` })
      } catch {}
      db.submissions.add(contest.id, [req.user.id], hex, req.body.optional)
      await fs.promises.writeFile(`${folder}/${hex}.png`, req.file.buffer)
      await spawn("ffmpeg", ["-i", `${folder}/${hex}.png`, "-lavfi", "split=3[a][b][c];[a]scale=w='min(iw,1280)':h=-1:flags=full_chroma_int[a];[b]scale=w='min(iw,480)':h=-1:flags=full_chroma_int[b]", "-map", "[a]", `${folder}/${hex}_thumbnail_large.webp`, "-map", "[b]", `${folder}/${hex}_thumbnail_small.webp`, "-map", "[c]", "-q:v", "95", `${folder}/${hex}.webp`]).promise
      res.sendStatus(201)
    }
  },
  delete: {
    execute(req, res) {
      const contest = db.contests.latest()
      if (contest.status !== "submissions") return res.sendStatus(403)
      const submission = db.submissions.artist.get(contest.id, req.user.id)
      if (!submission) return res.sendStatus(404)
      if (submission.artists[0].id !== req.user.id) return res.sendStatus(403)
      fs.promises.unlink(`assets/images/submissions/${contest.id}/${submission.image}.png`).catch(() => {})
      fs.promises.unlink(`assets/images/submissions/${contest.id}/${submission.image}.webp`).catch(() => {})
      fs.promises.unlink(`assets/images/submissions/${contest.id}/${submission.image}_thumbnail_small.webp`).catch(() => {})
      fs.promises.unlink(`assets/images/submissions/${contest.id}/${submission.image}_thumbnail_large.webp`).catch(() => {})
      db.submissions.delete(submission.id, submission.contest)
      db.submissions.invites.delete(submission.id, contest.id)
      res.sendStatus(200)
    }
  }
}