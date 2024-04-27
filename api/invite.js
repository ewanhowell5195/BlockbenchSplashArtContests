export default {
  get: {
    parameter: "invite",
    execute(req, res) {
      const invite = db.submissions.invites.getCode(req.params.invite)
      if (invite) return res.redirect("/submission")
      res.status(404).redirect("/")
    }
  },
  post: {
    execute(req, res) {
      const submission = db.submissions.invites.getAllowed(req.user.id)
      if (!submission) return res.sendStatus(403)
      const invite = f.randomString(8)
      db.events.add("invite", Date.now() + 86400000, {
        submission: 0,
        contest: 17,
        invite
      })
      return res.send(invite)
    }
  },
  delete: {
    execute(req, res) {
      const contest = db.contests.latest()
      if (contest.status !== "submissions") return res.sendStatus(403)
      const submission = db.artists.submission(contest.id, req.user.id)
      if (!submission) return res.sendStatus(404)
      db.submissions.invites.delete(submission.id, contest.id)
      res.sendStatus(200)
    }
  }
}