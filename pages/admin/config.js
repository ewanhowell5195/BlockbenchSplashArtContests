export default {
  config: {
    admin: true,
    title: "Admin"
  },
  data: () => ({
    contests: db.contests.all()
  }),
  get(path) {
    if (path.length === 1) {
      if (path[0] === "sql") {
        return {
          view: "sql/index",
          styles: "sql/styles",
          script: "sql/script"
        }
      }
    } else if (path.length === 2) {
      if (path[0] === "contests") {
        const contest = db.contests.get(path[1])
        if (!contest) return
        const submissions = db.submissions.contest(contest.id)
        return {
          view: "contest",
          styles: "contest",
          context: {
            config: {
              title: `Splash Art Contest ${contest.id} - ${contest.theme}`,
              description: `The ${f.numSuffix(contest.id)} Blockbench splash art contest! For Blockbench v${contest.version}${contest.status === "finished" ? ` - The ${contest.name} Update` : ""}. Theme: ${contest.theme}`,
              image: contest.status === "finished" && submissions.length ? `assets/images/submissions/${contest.id}/${submissions[0].image}_thumbnail_small.webp` : `assets/images/contests/concept_${contest.id}_thumbnail_small.webp`
            },
            currentContest: contest,
            submissions
          }
        }
      }
    }
  }
}