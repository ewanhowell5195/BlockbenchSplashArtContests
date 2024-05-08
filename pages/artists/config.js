export default {
  config: {
    title: "Artists",
    description: "See the artists who have entered submissions for the splash art contests"
  },
  get(path, req, context) {
    if (path.length > 1) return
    const artist = db.artists.get(path[0])
    if (!artist) return
    const submissions = db.submissions.artist.all(artist.id)
    if (context.contest.status !== "finished" && req.user.id !== artist.id) {
      const index = submissions.findIndex(e => e.contest.id === context.contest.id)
      if (index !== -1 ) submissions.splice(index, 1)
    }
    if (!submissions.length) return
    const votes = submissions.reduce((a, e) => a + e.votes, 0)
    const biggest = submissions.reduce((a, e) => a.votes > e.votes ? a : e)
    return {
      view: "artist/index",
      styles: "artist/styles",
      context: {
        config: {
          title: `${artist.name} - Blockbench Splash Art Contests`,
          description: `${artist.name}'${artist.name.endsWith("s") ? "" : "s"} profile. ${votes.toLocaleString()} vote${votes === 1 ? "" : "s"} across ${submissions.length.toLocaleString()} submission${submissions.length === 1 ? "" : "s"}.`,
          image: `assets/images/submissions/${biggest.contest.id}/${biggest.image}_thumbnail_small.webp`
        },
        image: `/assets/images/submissions/${biggest.contest.id}/${biggest.image}_thumbnail_large.webp`,
        artist,
        submissions,
        votes
      }
    }
  },
  pageList: () => db.artists.ids()
}