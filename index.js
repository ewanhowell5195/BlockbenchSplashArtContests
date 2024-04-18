import cookieParser from "cookie-parser"
import Database from "better-sqlite3"
import { config } from "dotenv"
import express from "express"
import path from "node:path"
import url from "node:url"
import fs from "node:fs"

config()

globalThis.database = new Database("database.db")
globalThis.db = (await import("./database/db.js")).default

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

async function loadPage(dir, parent) {
  const files = fs.readdirSync(dir)
  const obj = {}
  if (fs.existsSync(path.join(dir, "config.json"))) {
    obj.config = JSON.parse(fs.readFileSync(path.join(dir, "config.json")))
  } else if (fs.existsSync(path.join(dir, "config.js"))) {
    const config = (await import("./" + path.join("./", dir, "config.js"))).default
    obj.config = config.config
    obj.data = config.data
    obj.get = config.get
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
      obj.pages[file] = await loadPage(path.join(dir, file), obj)
    }
  }
  return obj
}

const pages = await loadPage("pages", {})

function send404(req, res) {
  res.status(404).render("layout", {
    config: {
      title: "Page Not Found"
    },
    content: path.join(__dirname, "views", "404.ejs"),
    script: null,
    styles: null,
    user: req.user
  })
}

app.get("*", async (req, res) => {
  if (req.path.startsWith("/src") || req.path.startsWith("/assets")) return send404(req, res)
  
  const parts = (req.path === "/" ? "index" : req.path.slice(1)).split("/")
  let dynamic
  let page = pages
  for (const [i, part] of parts.entries()) {
    if (!page.pages?.[part]) {
      if (page.get) {
        dynamic = parts.slice(i)
        break
      }
      return send404(req, res)
    }
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

  const context = {
    config: page.config,
    content: path.join(__dirname, "pages", parts.join("/"), "index.ejs"),
    script: page.script ? parts[parts.length - 1] + "/script.js" : null,
    styles: page.styles ? parts[parts.length - 1] + "/styles.css" : null,
    user: req.user
  }

  if (dynamic) {
    const data = page.get(dynamic)
    if (!data) {
      return send404(req, res)
    }
    if (data.context) {
      Object.assign(context, data.context)
    }
    if (data.view) {
      context.content = path.join(__dirname, "pages", parts.slice(0, dynamic.length).join("/"), data.view)
    }
  }

  if (page.data) {
    Object.assign(context, page.data())
  }

  res.render("layout", context)
})

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))