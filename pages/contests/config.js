export default {
  config: {
    title: "Contests",
    description: "View the current and previous Blockbench splash art contests"
  },
  data: () => ({
    contests: db.contests.all()
  }),
  get(path) {
    if (path.length > 1) return
    const contest = db.contests.get(path[0])
    if (!contest) return
    const submissions = db.submissions.contest(contest.id)
    return {
      view: "contest/index",
      styles: "contest/styles",
      context: {
        config: {
          title: `Splash Art Contest ${contest.id} - ${contest.theme}`,
          description: `The ${f.numSuffix(contest.id)} Blockbench splash art contest! For Blockbench v${contest.version}${contest.status === "finished" ? ` - The ${contest.name} Update` : ""} - Theme: ${contest.theme}`,
          image: contest.status === "finished" && submissions.length ? `assets/images/submissions/${contest.id}/${submissions[0].image}_thumbnail_small.webp` : `assets/images/contests/concept_${contest.id}_thumbnail_small.webp`
        },
        currentContest: contest,
        submissions
      }
    }
  },
  pageList: () => db.contests.ids()
}