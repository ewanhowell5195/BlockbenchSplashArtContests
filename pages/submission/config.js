export default {
  config: {
    auth: true,
    title: "Submit your splash art!"
  },
  data: (req, context) => ({
    submission: db.artists.submission(context.contest.id, req.user.id)
  })
}