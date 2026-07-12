export default {
  patch: {
    arguments: {
      name: {
        minLength: 2,
        maxLength: 32
      },
      socialMedia: {
        type: "url"
      },
      bio: {
        maxLength: 512
      }
    },
    async execute(req, res) {
      db.artists.update(req.user.id, req.body.name, req.body.socialMedia, req.body.bio)
      res.sendStatus(200)
    }
  }
}