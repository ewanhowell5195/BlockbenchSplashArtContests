export default {
  config: {
    auth: true,
    title: "Vote!"
  },
  data: (req, context) => ({
    submissions: context.contest.status === "voting" ? db.submissions.contest(context.contest.id) : undefined,
    voted: db.submissions.voted(context.contest.id, req.user.id)
  })
}