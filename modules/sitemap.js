app.get("/sitemap.xml", (req, res) => {
  const pageList = []
  function generate(pages, path) {
    for (const [key, value] of Object.entries(pages)) {
      if (value.config.admin) continue
      const current = `${path}/${key}`
      pageList.push(current)
      if (value.pages) {
        generate(value.pages, current)
      } else if (value.pageList) {
        pageList.push(...value.pageList().map(e => `${current}/${e}`))
      }
    }
  }
  generate(pages.pages, process.env.DOMAIN)
  res.header("Content-Type", "application/xml")
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageList.map(e => {
    if (e === "/index") e = "/"
    return `<url><loc>${e}</loc></url>`
  }).join("")}</urlset>`)
})