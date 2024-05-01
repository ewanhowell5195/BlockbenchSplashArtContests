export default {
  config: {
    auth: true,
    title: "Submit your splash art!"
  },
  data: (req, context) => {
    if (context.contest.status !== "submissions") return
    const submission = db.submissions.artist(context.contest.id, req.user.id)
    return {
      submission,
      artist: db.artists.get(req.user.id),
      invite: submission ? db.submissions.invites.get(submission.id, submission.contest) : undefined
    }
  }
}