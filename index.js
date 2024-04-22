import { renderToString } from "vue/server-renderer"
import cookieParser from "cookie-parser"
import Database from "better-sqlite3"
import { createSSRApp } from "vue"
import { config } from "dotenv"
import express from "express"
import path from "node:path"
import url from "node:url"
import https from "https"
import fs from "node:fs"
import cors from "cors"

config()

globalThis.database = new Database("database.db")
globalThis.db = (await import("./database/db.js")).default

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

globalThis.app = express()
app.use(express.json())
app.use(cookieParser())

const corsMiddleware = cors({
  origin(origin, cb) {
    cb(null, origin === process.env.DOMAIN)
  }
})
app.use(corsMiddleware)
app.options("*", corsMiddleware)

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
  const obj = { config: parent.config }
  if (fs.existsSync(path.join(dir, "config.json"))) {
    obj.config = Object.assign({ ...obj.config }, JSON.parse(fs.readFileSync(path.join(dir, "config.json"))))
  } else if (fs.existsSync(path.join(dir, "config.js"))) {
    const config = (await import("./" + path.join("./", dir, "config.js"))).default
    obj.config = Object.assign({ ...obj.config }, config.config)
    obj.data = config.data
    obj.get = config.get
  }
  for (const file of files) {
    if (file === "script.js") {
      obj.script = true
    } else if (file === "styles.css") {
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
    user: req.user,
    domain: process.env.DOMAIN
  }
  res.status(404).send(await renderToString(createSSRApp({
    data: () => context,
    template: await render("views/index.vue", context)
  })))
}

globalThis.f = {
  numSuffix(i) {
    const j = i % 10
    const k = i % 100
    if (j === 1 && k !== 11) return i + "st"
    if (j === 2 && k !== 12) return i + "nd"
    if (j === 3 && k !== 13) return i + "rd"
    return i + "th"
  },
  relativeTime(epoch) {
    const time = Date.now() / 1000
    const delta = time - epoch / 1000
    if (delta < 2 && delta > -2) return (delta >= 0 ? "just " : "") + "now"
    if (delta < 60 && delta > -60) return delta >= 0 ? Math.round(delta) + " seconds ago" : "in " + Math.round(-delta) + " seconds"
    if (delta < 120 && delta > -120) return delta >= 0 ? "about a minute ago" : "in about a minute"
    if (delta < 3600 && delta > -3600) return delta >= 0 ? Math.round(delta / 60) + " minutes ago" : "in " + Math.round(-delta / 60) + " minutes"
    if (delta < 7200 && delta > -7200) return delta >= 0 ? "about an hour ago" : "in about an hour"
    if (delta < 86400 && delta > -86400) return delta >= 0 ? Math.round(delta / 3600) + " hours ago" : "in " + Math.round(-delta / 3600) + " hours"
    if (delta < 172800 && delta > -172800) return delta >= 0 ? "1 day ago" : "in 1 day"
    if (delta < 2505600 && delta > -2505600) return delta >= 0 ? Math.round(delta / 86400) + " days ago" : "in " + Math.round(-delta / 86400) + " days"
    if (delta < 5184000 && delta > -5184000) return delta >= 0 ? "about a month ago" : "in about a month"
    const currentYear = new Date().getUTCFullYear()
    const epochYear = new Date(epoch).getUTCFullYear()
    const monthDelta = 12 * currentYear + new Date(time * 1000).getUTCMonth() + 1 - 12 * epochYear - new Date(epoch * 1000).getUTCMonth() - 1
    if (monthDelta < 12 && monthDelta > -12) return monthDelta >= 0 ? monthDelta + " months ago" : "in " + -monthDelta + " months";
    const yearDelta = currentYear - epochYear
    return yearDelta < 2 && yearDelta > -2 ? yearDelta >= 0 ? "a year ago" : "in a year" : yearDelta >= 0 ? yearDelta + " years ago" : "in " + -yearDelta + " years"
  }
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
    config: { ...page.config },
    content: path.join("pages", parts.join("/"), "index.vue"),
    script: page.script ? parts[parts.length - 1] + "/script.js" : null,
    styles: page.styles ? parts[parts.length - 1] + "/styles.css" : null,
    user: req.user,
    domain: process.env.DOMAIN,
    render,
    f
  }

  if (dynamic) {
    const data = page.get(dynamic)
    if (!data) {
      return send404(req, res)
    }
    if (data.context) {
      if (data.context.config) {
        data.context.config = Object.assign({ ...context.config }, data.context.config)
      }
      Object.assign(context, data.context)
    }
    if (data.view) {
      context.content = path.join("pages", parts.slice(0, dynamic.length).join("/"), data.view + ".vue")
    }
    if (data.script) {
      context.script = path.join(parts.slice(0, dynamic.length).join("/"), data.script + ".js")
    } else {
      context.script = null
    }
    if (data.styles) {
      context.styles = path.join(parts.slice(0, dynamic.length).join("/"), data.styles + ".css")
    } else {
      context.styles = null
    }
  }
  if (page.data) {
    Object.assign(context, page.data())
  }

  for (const key in context.config) {
    if (typeof context.config[key] === "function") {
      context.config[key] = context.config[key]()
    }
  }

  res.send(await renderToString(createSSRApp({
    data: () => context,
    template: await render("views/index.vue", context)
  })))
})

if (process.argv.includes("-dev")) {
  app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))
} else {
  const server = https.createServer({
    cert: fs.readFileSync("private/ewanhowell.com.pem"),
    key: fs.readFileSync("private/ewanhowell.com.key")
  }, app)

  server.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))
}