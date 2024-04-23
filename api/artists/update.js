export default {
  patch: {
    arguments: {
      name: {
        minLength: 2,
        maxLength: 32
      },
      socialMedia: {
        type: "url"
      }
    },
    async execute(req, res) {
      db.artists.update(req.user.id, req.body.name, req.body.socialMedia)
      res.sendStatus(200)
    }
  }
}