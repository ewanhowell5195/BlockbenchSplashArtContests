export default {
  config: {
    auth: true,
    title: "Vote!"
  },
  data: (req, context) => {
    const submissions = context.contest.status === "voting" ? db.submissions.contest(context.contest.id) : undefined
    return {
      submissions,
      voted: db.submissions.voted(context.contest.id, req.user.id),
      voteCount: submissions ? Math.ceil(submissions.length * 0.2) : undefined
    }
  }
}