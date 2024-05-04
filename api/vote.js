export default {
  post: {
    arguments: {
      votes: {
        type: "array",
        validate: i => typeof i === "number"
      }
    },
    execute(req, res) {
      if (req.body.votes.length !== new Set(req.body.votes).size) return res.sendStatus(400)
      const contest = db.contests.latest()
      if (contest.status !== "voting") return res.sendStatus(403)
      if (db.submissions.voted(contest.id, req.user.id)) return res.sendStatus(403)
      const submissions = db.submissions.contest(contest.id)
      if (req.body.votes.length !== submissions.length) return res.sendStatus(400)
      if (!req.body.votes.every(e => submissions.some(s => s.id === e))) return res.sendStatus(400)
      const votes = Math.ceil(submissions.length * 0.2)
      for (let x = 0; x < votes; x++) {
        db.submissions.vote(req.body.votes[x], contest.id, req.user.id)
      }
      res.sendStatus(200)
      updateVotes(contest.id)
    }
  }
}

let run
let running
async function updateVotes(id) {
  if (running) {
    run = true
    return
  }
  running = true
  await sendWs({
    type: "votes",
    votes: db.submissions.votes(id)
  })
  setTimeout(() => {
    running = false
    if (run) {
      run = false
      updateVotes(id)
    }
  }, 5000)
}