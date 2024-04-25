export default {
  config: {
    auth: true,
    title: "Submit your splash art!"
  },
  data: req => {
    const contest = db.contests.latest()
    return {
      contest,
      submission: db.artists.submission(contest.id, req.user.id)
    }
  }
}