const avatarTypes = ["image/png", "image/jpeg", "image/webp"]

export default {
  post: {
    check(req, res, next) {
      if (!db.artists.get(req.user.id)) return res.sendStatus(403)
      next()
    },
    upload: {
      field: "avatar",
      filter: (req, file, next) => {
        if (avatarTypes.includes(file.mimetype)) {
          next(null, true)
        } else {
          req.error = "The provided file was not a PNG, JPEG, or WebP file"
          next(null, false)
        }
      }
    },
    async execute(req, res) {
      const p = spawn("ffprobe", ["-v", "quiet", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", "-"], { stdio: ["pipe", "pipe", "ignore"] })
      p.stdin.on("error", () => {})
      p.stdin.write(req.file.buffer)
      p.stdin.end()
      let arr = []
      for await (const part of p.stdout) {
        arr.push(part)
      }
      const size = Buffer.concat(arr).toString().split(",").map(e => Number(e))
      if (size.length !== 2 || size.some(e => isNaN(e))) {
        return res.status(400).send({ error: "Error reading image file" })
      }
      if (Math.min(...size) < 64) {
        return res.status(400).send({ error: "Image too small. The minimum size is 64x64" })
      }
      if (Math.max(...size) > 8192) {
        return res.status(400).send({ error: "Image too large. The maximum size is 8192x8192" })
      }
      if (!await avatars.convert(req.file.buffer, req.user.id)) {
        return res.status(500).send({ error: "An error occurred while processing the avatar" })
      }
      res.send(avatars.url(req.user.id))
    }
  },
  delete: {
    check(req, res, next) {
      if (!db.artists.get(req.user.id)) return res.sendStatus(403)
      next()
    },
    async execute(req, res) {
      await avatars.remove(req.user.id)
      res.sendStatus(200)
    }
  }
}