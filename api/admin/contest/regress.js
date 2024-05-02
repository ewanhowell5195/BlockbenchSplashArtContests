export default {
  patch: {
    admin: true,
    execute(req, res) {
      const contest = db.contests.latest()
      if (contest.status === "finished" || contest.status === "upcoming") return res.sendStatus(400)
      db.contests.regress()
      res.sendStatus(200)
    }
  }
}