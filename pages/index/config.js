const STATS_TTL = 60 * 60 * 1000
let stats
let statsTime = 0

export default {
  data(req, context) {
    const all = db.contests.all()
    const finished = all.filter(e => e.status === "finished")
    const collage = (settings.homeCollage ?? []).map(id => finished.find(e => e.id === id)).filter(Boolean)
    if (!stats || Date.now() - statsTime > STATS_TTL) {
      stats = db.artists.stats()
      stats.years = Math.floor((Date.now() - stats.started) / (365.25 * 24 * 60 * 60 * 1000))
      stats.perContest = Math.round(stats.submissions / stats.contests)
      const voters = stats.knownVotes ? stats.votes * stats.knownVoters / stats.knownVotes : 0
      stats.voters = Math.round(voters / 1000) * 1000 || Math.round(voters / 100) * 100
      statsTime = Date.now()
    }
    return {
      contests: context.contest.status === "finished" ? all : [context.contest],
      stats,
      collage: (collage.length ? collage : finished.slice(0, 3)).map(contest => ({
        id: contest.id,
        image: contest.image
      })),
      winners: finished.slice(0, 3).map(contest => ({
        id: contest.id,
        theme: contest.theme,
        version: contest.version,
        image: contest.image,
        artists: db.submissions.contest(contest.id)[0]?.artists ?? []
      })),
      topArtists: db.artists.all("votes", "desc", 6, 0, "")
    }
  }
}