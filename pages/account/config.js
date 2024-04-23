export default {
  config: {
    auth: true,
    title: "Your Account"
  },
  data: req => ({
    artist: db.artists.get(req.user.id)
  })
}