export default {
  delete: {
    admin: true,
    parameter: ["contest", "id"],
    execute(req, res) {
      const contest = parseInt(req.params.contest)
      const id = parseInt(req.params.id)
      if (isNaN(contest) || isNaN(id)) return res.sendStatus(400)
      const submission = db.submissions.get(id, contest)
      if (!submission) return res.sendStatus(404)
      fs.promises.unlink(`assets/images/submissions/${contest}/${submission.image}.png`).catch(() => {})
      fs.promises.unlink(`assets/images/submissions/${contest}/${submission.image}.webp`).catch(() => {})
      fs.promises.unlink(`assets/images/submissions/${contest}/${submission.image}_thumbnail_small.webp`).catch(() => {})
      fs.promises.unlink(`assets/images/submissions/${contest}/${submission.image}_thumbnail_large.webp`).catch(() => {})
      db.submissions.delete(submission.id, contest)
      db.submissions.invites.delete(submission.id, contest)
      res.sendStatus(200)
    }
  }
}
