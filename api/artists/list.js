export default {
  get: {
    public: true,
    execute(req, res) {
      res.send(db.artists.all("votes", "desc", 100000, 0, ""))
    }
  }
}