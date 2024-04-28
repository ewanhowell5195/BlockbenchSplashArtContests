export default {
  config: {
    auth: true,
    title: "Submit your splash art!"
  },
  data: (req, context) => {
    const submission = db.submissions.artist(context.contest.id, req.user.id)
    return {
      submission,
      invite: submission ? db.submissions.invites.get(submission.id, submission.contest) : undefined
    }
  }
}