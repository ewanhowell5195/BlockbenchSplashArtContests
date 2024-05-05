export default {
  get: {
    parameter: "invite",
    execute(req, res) {
      if (db.contests.latest().status !== "submissions") return res.sendStatus(403)
      const invite = db.submissions.invites.getCode(req.params.invite)
      if (!invite) return res.status(404).redirect("/")
      if (!db.submissions.invites.acceptAllowed(invite.data.contest, req.user.id)) return res.status(403).redirect("/")
      db.artists.add(req.user.id, req.user.global_name, null)
      db.submissions.invites.accept(invite.data.submission, invite.data.contest, req.user.id)
      db.events.delete(invite.id)
      return res.redirect("/submission")
    }
  },
  post: {
    execute(req, res) {
      const submission = db.submissions.invites.getAllowed(req.user.id)
      if (!submission) return res.sendStatus(403)
      const invite = f.randomString(8)
      db.events.add("invite", Date.now() + 86400000, {
        submission: submission.id,
        contest: submission.contest,
        invite
      })
      return res.send(invite)
    }
  },
  delete: {
    execute(req, res) {
      const contest = db.contests.latest()
      if (contest.status !== "submissions") return res.sendStatus(403)
      const submission = db.submissions.artist.get(contest.id, req.user.id)
      if (!submission) return res.sendStatus(404)
      db.submissions.invites.delete(submission.id, contest.id)
      res.sendStatus(200)
    }
  }
}