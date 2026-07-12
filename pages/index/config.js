export default {
  data(req, context) {
    const all = db.contests.all()
    const finished = all.filter(e => e.status === "finished")
    const collage = (settings.homeCollage ?? []).map(id => finished.find(e => e.id === id)).filter(Boolean)
    return {
      contests: context.contest.status === "finished" ? all : [context.contest],
      stats: db.artists.stats(),
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
      topArtists: db.artists.all("votes", "desc", 4, 0, "")
    }
  }
}