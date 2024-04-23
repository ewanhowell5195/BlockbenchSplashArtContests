export default {
  post: {
    async execute(req, res) {
      db.artists.add(req.user.id, req.user.global_name, null)
      res.sendStatus(200)
    }
  }
}