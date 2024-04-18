import cookieParser from "cookie-parser"
import { config } from "dotenv"
import express from "express"
import path from "node:path"
import url from "node:url"
import fs from "node:fs"

config()

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

globalThis.app = express()
app.set("view engine", "ejs")
app.use(express.json())
app.use(cookieParser())

await import("./auth.js")

app.get("/logout", (req, res) => {
  req.session.destroy()
  res.clearCookie("connect.sid")
  res.redirect("/")
})

app.use("/src", express.static("pages"))
app.use("/assets", express.static("assets"))

function loadPage(dir, parent) {
  const files = fs.readdirSync(dir)
  const obj = {}
  if (fs.existsSync(path.join(dir, "config.json"))) {
    obj.config = JSON.parse(fs.readFileSync(path.join(dir, "config.json")))
  } else {
    obj.config = parent.config
  }
  for (const file of files) {
    if (file.endsWith(".js")) {
      obj.script = true
    } else if (file.endsWith(".css")) {
      obj.styles = true
    } else if (!file.includes(".")) {
      obj.pages ??= {}
      obj.pages[file] = loadPage(path.join(dir, file), obj)
    }
  }
  return obj
}

const pages = loadPage("pages", {})

app.get("*", async (req, res) => {
  if (req.path.startsWith("/src") || req.path.startsWith("/assets")) return res.sendStatus(404)
  
  const parts = (req.path === "/" ? "index" : req.path.slice(1)).split("/")
  let page = pages
  for (const part of parts) {
    if (!page.pages[part]) return res.sendStatus(404)
    page = page.pages[part]
  }

  if (page.config.auth && !req.user) {
    res.cookie("authRedirect", req.originalUrl, {
      httpOnly: true,
      secure: process.env.DOMAIN.startsWith("https"),
      maxAge: 300000
    })
    return res.redirect("/auth/discord")
  }

  res.render("layout", {
    config: config,
    content: path.join(__dirname, "pages", parts.join("/"), "index.ejs"),
    script: page.script ? parts[parts.length - 1] + "/script.js" : null,
    styles: page.styles ? parts[parts.length - 1] + "/styles.css" : null
  })
})

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))