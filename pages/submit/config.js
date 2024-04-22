export default {
  config: {
    auth: true,
    title: "Submit your splash art!"
  },
  data: () => ({
    contest: db.contests.latest()
  })
}