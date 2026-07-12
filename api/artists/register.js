export default {
  post: {
    async execute(req, res) {
      if (db.artists.add(req.user.id, req.user.global_name ?? req.user.username, null).changes) {
        await avatars.download(req.user)
      }
      res.sendStatus(200)
    }
  }
}