export default {
  config: {
    auth: true,
    title: "Your Account",
    description: "Manage your splash art contest account and profile."
  },
  data: req => ({
    artist: db.artists.get(req.user.id)
  })
}