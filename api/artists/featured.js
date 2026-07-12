export default {
  post: {
    arguments: {
      image: {
        required: true,
        minLength: 64,
        maxLength: 64
      }
    },
    async execute(req, res) {
      const latest = db.contests.latest()
      const submission = db.submissions.artist.all(req.user.id).find(e => e.image === req.body.image && (e.contest.id !== latest.id || latest.status === "finished"))
      if (!submission) return res.sendStatus(400)
      db.artists.setFeatured(req.user.id, req.body.image)
      res.sendStatus(200)
    }
  },
  delete: {
    execute(req, res) {
      if (!db.artists.get(req.user.id)) return res.sendStatus(403)
      db.artists.setFeatured(req.user.id, null)
      res.sendStatus(200)
    }
  }
}