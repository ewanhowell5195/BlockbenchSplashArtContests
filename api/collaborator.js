export default {
  delete: {
    parameter: "id",
    execute(req, res) {
      const contest = db.contests.latest()
      if (contest.status !== "submissions") return res.sendStatus(403)
      const submission = db.submissions.artist(contest.id, req.user.id)
      if (!submission) return res.sendStatus(404)
      if ((req.params.id === req.user.id && submission.artists[0].id === req.user.id) || (req.params.id !== req.user.id && submission.artists[0].id !== req.user.id)) {
        return res.sendStatus(403)
      }
      db.submissions.removeArtist(submission.id, submission.contest, submission.artists.findIndex(e => e.id === req.params.id))
      res.sendStatus(200)
    }
  }
}