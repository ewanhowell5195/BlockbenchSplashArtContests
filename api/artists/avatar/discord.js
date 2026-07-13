export default {
  post: {
    check(req, res, next) {
      if (!db.artists.get(req.user.id)) return res.sendStatus(403)
      next()
    },
    async execute(req, res) {
      if (!req.user.avatarID) return res.status(400).send({ error: "Your Discord account has no avatar" })
      const hash = await avatars.download(req.user)
      if (!hash) return res.status(500).send({ error: "Failed to download your Discord avatar" })
      res.send(avatars.url(req.user.id, hash))
    }
  }
}