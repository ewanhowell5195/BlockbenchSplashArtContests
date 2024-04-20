export default {
  config: {
    title: "Contests - Blockbench Splash Art Contests"
  },
  data: () => ({
    contests: db.contests.all()
  }),
  get(path) {
    if (path.length > 1) return
    const contest = db.contests.get(path[0])
    if (!contest) return
    return {
      view: "contest",
      styles: "contest",
      context: {
        config: {
          title: `Splash Art Contest ${contest.id} - The ${contest.name} Update`
        },
        contest,
        submissions: db.submissions.contest(contest.id)
      }
    }
  } 
}