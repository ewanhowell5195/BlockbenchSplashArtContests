export default {
  config: {
    auth: true,
    title: "Vote! - Blockbench Splash Art Contests",
    description: "Submit you vote for the current splash art contest!"
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