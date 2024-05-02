export default {
  patch: {
    admin: true,
    execute(req, res) {
      const contest = db.contests.latest()
      if (contest.status === "finished") return res.sendStatus(400)
      db.contests.progress()
      res.sendStatus(200)
    }
  }
}