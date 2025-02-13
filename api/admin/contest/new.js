export default {
  post: {
    admin: true,
    ratelimit: 1,
    check(req, res, next) {
      const contest = db.contests.latest()
      if (contest.status !== "finished") return res.sendStatus(403)
      next()
    },
    upload: {
      field: "image",
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
      theme: {
        type: "string",
        required: true
      },
      version: {
        type: "string",
        required: true
      },
      update: {
        type: "string",
        required: true
      },
      description: {
        type: "string"
      },
      date: {
        type: "integer",
        required: true
      },
      open: {
        type: "integer",
        required: true
      },
      close: {
        type: "integer",
        required: true
      },
      vote: {
        type: "integer",
        required: true
      },
      finish: {
        type: "integer",
        required: true
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
      const minSize = 720
      const maxSize = 4096
      if (size[0] < minSize || size[1] < minSize) {
        return res.status(400).send({ error: `Image too small. The minimum size is ${minSize.toLocaleString()}x${minSize.toLocaleString()}px` })
      }
      if (size[0] > maxSize || size[1] > maxSize) {
        return res.status(400).send({ error: `Image too large. The maximum size is ${maxSize.toLocaleString()}x${maxSize.toLocaleString()}px` })
      }
      if (
        req.body.date < Date.now() - 86400000 ||
        req.body.start <= req.body.date ||
        req.body.close <= req.body.start ||
        req.body.vote <= req.body.close ||
        req.body.finish <= req.body.vote
      ) {
        return res.status(400).send({ error: "Invalid date" })
      }
      const path = "assets/images/contests/concept_" + (db.contests.latest().id + 1)
      await fs.promises.writeFile(path + ".png", req.file.buffer)
      await spawn("ffmpeg", ["-i", path + ".png", "-lavfi", "split=3[a][b][c];[a]scale=w='min(iw,1280)':h=-1:flags=full_chroma_int[a];[b]scale=w='min(iw,480)':h=-1:flags=full_chroma_int[b]", "-map", "[a]", path + "_thumbnail_large.webp", "-map", "[b]", path + "_thumbnail_small.webp", "-map", "[c]", "-q:v", "95", path + ".webp"]).promise
      db.contests.add(req.body.date, req.body.open, req.body.close, req.body.vote, req.body.finish, req.body.version, req.body.update, req.body.theme, req.body.description)
      res.sendStatus(201)
    }
  }
}