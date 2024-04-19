import { renderToString } from "vue/server-renderer"
import cookieParser from "cookie-parser"
import Database from "better-sqlite3"
import { createSSRApp } from "vue"
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

async function render(path, context) {
  let contents = await fs.promises.readFile(path, "utf-8")
  const sections = new Set(Array.from(contents.matchAll(/<render>([a-z0-9]+)<\/render>/gi)).map(e => e[1]))
  for (const section of sections) {
    if (!(section in context)) continue
    contents = contents.replaceAll(`<render>${section}</render>`, await render(context[section], context))
  }
  return contents
}

async function send404(req, res) {
  const context = {
    config: {
      title: "Page Not Found"
    },
    content: path.join("views", "404.vue"),
    script: null,
    styles: null,
    user: req.user
  }
  res.status(404).send(await renderToString(createSSRApp({
    data: () => context,
    template: await render("views/index.vue", context)
  })))
}

const index = fs.readFileSync("views/index.vue", "utf-8")
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
    content: path.join("pages", parts.join("/"), "index.vue"),
    script: page.script ? parts[parts.length - 1] + "/script.js" : null,
    styles: page.styles ? parts[parts.length - 1] + "/styles.css" : null,
    user: req.user,
    render
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
      context.content = path.join("pages", parts.slice(0, dynamic.length).join("/"), data.view + ".vue")
    }
  }

  if (page.data) {
    Object.assign(context, page.data())
  }

  res.send(await renderToString(createSSRApp({
    data: () => context,
    template: await render("views/index.vue", context)
  })))
})

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))