export default {
  config: {
    title: "Blockbench Splash Art Contests",
    description: "Vote on and view submissions for the Blockbench splash art contests!",
    colour: "#212E3C",
    image() {
      const winner = db.submissions.latestWinner()
      return `assets/images/submissions/${winner.contest}/${winner.image}.png`
    }
  }
}