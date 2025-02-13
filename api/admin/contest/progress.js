export default {
  patch: {
    admin: true,
    execute(req, res) {
      const contest = db.contests.latest()
      if (contest.status === "finished") return res.sendStatus(400)
      if (contest.status === "submissions") {
        if (!db.contests.progressable()) {
          return res.sendStatus(409)
        }
      }
      db.contests.progress()
      res.sendStatus(200)
    }
  }
}