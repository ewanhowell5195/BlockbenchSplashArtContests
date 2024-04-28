export default {
  config: {
    auth: true,
    title: "Vote!"
  },
  data: (req, context) => ({
    submissions: context.contest.status === "voting" ? db.submissions.contest(context.contest.id) : undefined
  })
}