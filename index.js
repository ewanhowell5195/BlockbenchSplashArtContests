import settings from "./settings.json" assert { type: "json" }
import { renderToString } from "vue/server-renderer"
import cookieParser from "cookie-parser"
import Database from "better-sqlite3"
import { createSSRApp } from "vue"
import { config } from "dotenv"
import express from "express"
import path from "node:path"
import crypto from "crypto"
import url from "node:url"
import https from "https"
import fs from "node:fs"
import cors from "cors"

config()

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

globalThis.database = new Database("database.db")
globalThis.db = (await import("./database/db.js")).default
globalThis.createHash = crypto.createHash
globalThis.settings = settings
globalThis.app = express()
globalThis.path = path
globalThis.fs = fs

app.use(express.json())
app.use(cookieParser())

const corsMiddleware = cors({
  origin(origin, cb) {
    cb(null, origin === process.env.DOMAIN)
  }
})
app.use(corsMiddleware)
app.options("*", corsMiddleware)

globalThis.server = https.createServer({
  cert: fs.readFileSync("private/ewanhowell.com.pem"),
  key: fs.readFileSync("private/ewanhowell.com.key")
}, app)

await import("./auth.js")

for (const file of fs.readdirSync("modules")) {
  await import("./modules/" + path.basename(file))
}

app.get("/logout", (req, res) => {
  req.session.destroy()
  res.clearCookie("connect.sid")
  res.redirect("/")
})

app.use("/src", (req, res, next) => {
  const extname = path.extname(req.path)
  const basename = path.basename(req.path)
  if (
    extname === ".json" ||
    extname === ".vue" ||
    basename === "config.js"
  ) return send404(req, res)
  next()
}, express.static("pages"))
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
    obj.pageList = config.pageList
  }
  for (const file of files) {
    if (file === "script.js") {
      obj.script = true
    } else if (file === "styles.css") {
      obj.styles = true
    } else if (!file.includes(".") && !obj.get) {
      obj.pages ??= {}
      obj.pages[file] = await loadPage(path.join(dir, file), obj)
    }
  }
  return obj
}

globalThis.pages = await loadPage("pages", {})

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
    domain: process.env.DOMAIN,
    contest: db.contests.latest()
  }
  res.status(404).send("<!DOCTYPE html>" + await renderToString(createSSRApp({
    data: () => context,
    template: await render("views/index.vue", context)
  })))
}

const thumbnailCache = {}

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
    const now = Date.now()
    const delta = epoch - now
    if (delta < 60000) return "soon"
    const years = Math.floor(delta / 3.1536e10)
    let days = Math.floor(delta / 8.64e7) % 365
    const weeks = Math.floor(days / 7)
    days %= 7
    const hours = Math.floor(delta / 3.6e6) % 24
    const minutes = Math.floor(delta / 6e4) % 60
    if (!years && !weeks && !days && !hours) {
      return `in ${minutes} minute${minutes === 1 ? "" : "s"}`
    }
    return `in ${years} year${years === 1 ? "" : "s"}, ${weeks} week${weeks === 1 ? "" : "s"}, ${days} day${days === 1 ? "" : "s"}, ${hours} hour${hours === 1 ? "" : "s"}`.replace(/(?<!\d)0\s[a-z]+,\s/g, "")
  },
  randomString: l => Array.from(crypto.getRandomValues(new Uint32Array(l))).map(n => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[n%62]).join(""),
  blurImageSVG: (url, brightness = 2, saturation = 2) => {
    let base64 = thumbnailCache[url]
    if (!base64) {
      base64 = fs.readFileSync(url).toString("base64")
      thumbnailCache[url] = base64
    }
    return "url('data:image/svg+xml;base64," + btoa(`
      <svg width="2100" height="900" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <filter id="blur-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
            <feColorMatrix
              type="matrix"
              values="${brightness} 0 0 0 0.25
                      0 ${brightness} 0 0 0.25
                      0 0 ${brightness} 0 0.25
                      0 0 0 1 0" />
            <feColorMatrix type="saturate" values="${saturation}"/>
          </filter>
        </defs>
        <image xlink:href="data:image/webp;base64,${base64}" width="2310" height="990" transform="translate(-105, -45)" filter="url(#blur-filter)" preserveAspectRatio="none" />
      </svg>
    `) + "')"
  },
  prettyURL(link) {
    const url = new URL(link)
    return decodeURI(url.hostname + url.pathname).replace(/\/$/, "")
  }
}

async function renderTemplate(req, res, page, context, template = "index") {
  for (const key in context.config) {
    if (typeof context.config[key] === "function") {
      context.config[key] = context.config[key](req, context)
    }
  }

  res.send("<!DOCTYPE html>" + await renderToString(createSSRApp({
    data: () => context,
    template: await render(`views/${template}.vue`, context),
    compilerOptions: {
      isCustomElement: tag => tag === "file-input"
    }
  })))
}

const crawlers = [
  "discordbot",
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "facebookexternalhit",
  "facebot",
  "ia_archiver",
  "twitterbot",
  "redditbot",
  "slackbot"
]

function isCrawler(userAgent) {
  if (!userAgent) return
  userAgent = userAgent.toLowerCase()
  return crawlers.some(e => userAgent.includes(e))
}

app.get("*", async (req, res) => {
  if (req.path !== "/" && req.path.endsWith("/")) {
    Object.defineProperty(req, "path", {
      value: req.path.slice(0, -1)
    })
  }

  if (
    req.path.startsWith("/src") ||
    req.path.startsWith("/assets")
  ) return send404(req, res)
  
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

  if (page.config.auth && isCrawler(req.get("User-Agent"))) {
    if (page.config.admin) return res.sendStatus(404)
    return renderTemplate(req, res, page, {
      config: { ...page.config },
      domain: process.env.DOMAIN
    }, "opengraph")
  }

  if ((page.config.auth || page.config.admin) && !req.user) {
    res.cookie("authRedirect", req.originalUrl, {
      httpOnly: true,
      secure: process.env.DOMAIN.startsWith("https"),
      maxAge: 300000
    })
    return res.status(401).redirect("/auth/discord")
  }
  if (page.config.admin && !req.user?.admin) {
    return res.status(401).redirect("/")
  }

  const context = {
    config: { ...page.config },
    content: path.join("pages", parts.join("/"), "index.vue"),
    script: page.script ? parts[parts.length - 1] + "/script.js" : null,
    styles: page.styles ? parts[parts.length - 1] + "/styles.css" : null,
    user: req.user,
    domain: process.env.DOMAIN,
    contest: db.contests.latest(),
    settings,
    render,
    f
  }

  if (dynamic) {
    const data = page.get(dynamic, req, context)
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
    Object.assign(context, page.data(req, context))
  }

  renderTemplate(req, res, page, context)
})

process.on("unhandledRejection", error => {
  console.error("Unhandled rejection at", new Date())
  console.error(error.message)
  console.error(error.stack)
})

process.on("uncaughtException", error => {
  console.error("Uncaught exception at", new Date())
  console.error(error.message)
  console.error(error.stack)
})

function ready() {
  console.log(`Listening on port ${process.env.PORT}`)
  eventHandler()
}

if (process.argv.includes("-dev")) {
  app.listen(process.env.PORT, ready)
} else {
  server.listen(process.env.PORT, ready)
}