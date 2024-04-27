import { Strategy as DiscordStrategy } from "passport-discord-auth"
import session from "express-session"
import passport from "passport"

const FileStore = (await import("session-file-store")).default(session)

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.DOMAIN.startsWith("https"),
    maxAge: 86400000,
    sameSite: "Lax"
  },
  store: new FileStore({
    logFn: () => {}
  })
}))
app.use(passport.initialize())
app.use(passport.session())
app.set("trust proxy", 1)

passport.use(new DiscordStrategy({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackUrl: `${process.env.DOMAIN}/auth/discord/callback`,
  scope: ["identify"]
},
(accessToken, refreshToken, profile, done) => {
  done(null, profile)
}))

passport.serializeUser((user, done) => {
  user.avatarID = user.avatar
  user.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => done(null, user))

app.get("/auth/discord", passport.authenticate("discord"))

app.get("/auth/discord/callback", passport.authenticate("discord", {
  failureRedirect: "/"
}), (req, res) => {
  const redirectUrl = req.cookies.authRedirect ?? "/"
  res.clearCookie("authRedirect")
  res.redirect(redirectUrl)
})