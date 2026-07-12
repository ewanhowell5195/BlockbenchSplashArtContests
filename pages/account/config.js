export default {
  config: {
    auth: true,
    title: "Your Account",
    description: "Manage your splash art contest account and profile."
  },
  data: req => {
    const artist = db.artists.get(req.user.id)
    let finishedSubmissions = []
    let hasProfile = false
    if (artist) {
      const latest = db.contests.latest()
      const submissions = db.submissions.artist.all(artist.id)
      finishedSubmissions = submissions.filter(e => e.contest.id !== latest.id || latest.status === "finished")
      hasProfile = submissions.length > 0
    }
    return {
      artist,
      artistAvatar: artist?.avatar ? avatars.url(artist.id) : null,
      finishedSubmissions,
      hasProfile
    }
  }
}