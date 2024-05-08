export default {
  data(req, context) {
    return {
      contests: context.contest.status === "finished" ? db.contests.all() : [context.contest] 
    }
  }
}