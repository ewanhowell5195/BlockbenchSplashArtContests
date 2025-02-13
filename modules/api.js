import multer from "multer"

const getFiles = async function*(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

const ratelimitCache = {}
const urlTest = /^https?:\/\/(?:[-a-z0-9@:%._\+~#=]{1,256}\.[a-z0-9()]{1,6}\b|\[[:0-9]{2,}\])([-a-z0-9()@:%_\+.~#?&\/=]*)$/i
for await (const f of getFiles("api")) {
  const api = (await import("../" + path.relative("./", f).replace(/\\/g, "/"))).default
  for (const [method, data] of Object.entries(api)) {
    const path = f.split("api")[1].replace(/\\/g, "/").slice(0, -3)
    data.path = `/api${path}`
    if (data.parameter) data.path += `/:${data.parameter}`
    async function execute(req, res) {
      if (req.error) return res.status(400).send({ error: req.error })
      if (Object.keys(req.body).length && !data.arguments) return res.sendStatus(400)
      for (const arg of Object.keys(req.body)) {
        if (!data.arguments[arg])  return res.sendStatus(400)
      }
      if (data.upload && !req.file) return res.sendStatus(400)
      if (data.arguments) {
        for (const [id, conf] of Object.entries(data.arguments)) {
          let arg = req.body?.[id]
          if (typeof arg === "string") {
            arg = arg.trim()
          }
          if (arg === undefined) {
            if (!conf.required) continue
            return res.sendStatus(400)
          }
          if (conf.type === "url") {
            if (typeof arg !== "string" || !urlTest.test(arg)) return res.status(400).send({
              error: `Invalid "${id}"`,
              key: id
            })
            if (arg.length > 250) return res.status(400).send({
              error: `"${id}" too long`,
              key: id
            })
          } else if (conf.type === "array") {
            if (!Array.isArray(arg)) return res.sendStatus(400)
            if (conf.validate) {
              for (const item of arg) {
                if (!conf.validate(item)) return res.sendStatus(400)
              }
            }
          } else if (conf.type === "boolean") {
            if (arg === "true") arg = true
            else if (arg === "false") arg = false
            if (typeof arg !== "boolean") return res.sendStatus(400)
          } else if (conf.type === "integer") {
            arg = parseInt(arg)
            if (isNaN(arg) || arg === Infinity || arg > Number.MAX_SAFE_INTEGER || arg < Number.MIN_SAFE_INTEGER) {
              return res.sendStatus(400)
            }
          } else {
            if (typeof arg !== "string") return res.sendStatus(400)
            if (conf.minLength && arg.length < conf.minLength) return res.status(400).send({
              error: `"${id}" too short`,
              key: id
            })
            if (conf.maxLength && arg.length > conf.maxLength) return res.status(400).send({
              error: `"${id}" too long`,
              key: id
            })
          }
          req.body[id] = arg
        }
      }
      data.execute(req, res)
    }
    let parts = [data.path]
    if (data.ratelimit !== false) parts.push((req, res, next) => {
      const ip = req.headers["x-forwarded-for"] ?? req.socket.remoteAddress 
      ratelimitCache[req.url] ??= {}
      if (ratelimitCache[req.url][ip]) {
        if (ratelimitCache[req.url][ip] >= (data.ratelimit ?? 5)) return res.sendStatus(429)
        ratelimitCache[req.url][ip]++
      } else {
        ratelimitCache[req.url][ip] = 1
        setTimeout(() => delete ratelimitCache[req.url][ip], 5000)
      }
      next()
    })
    if (!data.public) parts.push((req, res, next) => {
      if (!req.user) {
        if (req.method === "GET") {
          res.cookie("authRedirect", req.originalUrl, {
            httpOnly: true,
            secure: process.env.DOMAIN.startsWith("https"),
            maxAge: 300000
          })
          return res.status(401).redirect("/auth/discord")
        }
        return res.sendStatus(401)
      }
      next()
    })
    if (data.admin) parts.push((req, res, next) => {
      if (!req.user?.admin) {
        return res.sendStatus(401)
      }
      next()
    })
    if (data.check) parts.push(data.check)
    if (data.upload) parts.push(
      multer({
        limits: { fileSize: settings.maxFileSize },
        storage: multer.memoryStorage(),
        fileFilter: data.upload.filter
      }).single(data.upload.field),
      (err, req, res, next) => {
        if (err?.code === "LIMIT_FILE_SIZE") {
          return res.status(400).send({ error: `File size too large. The maximum file size is ${settings.maxFileSize / 1024 / 1024} MB` })
        } else if (err) {
          return res.status(500).send({ error: "An error occurred during the upload process" })
        }
      }
    )
    parts.push(execute)
    app[method](...parts, execute)
  }
}

app.get("/api/*", (req, res) => res.sendStatus(404))