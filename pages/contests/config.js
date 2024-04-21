export default {
  config: {
    title: "Contests - Blockbench Splash Art Contests",
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
      view: "contest",
      styles: "contest",
      context: {
        config: {
          title: `Splash Art Contest ${contest.id} - The ${contest.name} Update`,
          description: `The ${f.numSuffix(contest.id)} splash art contest! For Blockbench v${contest.version} - The ${contest.name} Update. Theme: ${contest.theme}`,
          image: `assets/images/submissions/${contest.id}/${submissions[0].image}.png`
        },
        contest,
        submissions
      }
    }
  } 
}