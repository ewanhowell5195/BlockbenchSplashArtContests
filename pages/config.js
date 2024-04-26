export default {
  config: {
    title: "Blockbench Splash Art Contests",
    description: "Vote on and view submissions for the Blockbench splash art contests!",
    colour: "#212E3C",
    image(req, context) {
      const image = db.contests.mainImage()
      if (image.contest) {
        if (image.image) return `assets/images/submissions/${image.contest}/${image.image}_thumbnail_small.webp`
        else return `assets/images/contests/concept_${image.contest}_thumbnail_small.webp`
      }
      return `assets/images/contests/concept_${context.contest.id}_thumbnail_small.webp`
    }
  }
}