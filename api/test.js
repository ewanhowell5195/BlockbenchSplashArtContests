export default {
  get: {
    public: true,
    parameter: "thing",
    execute(req, res) {
      return res.send(req.params.thing)
    }
  }
}