const sortOptions = [
  ["votes", "Votes"],
  ["wins", "Wins"],
  ["submissions", "Submissions"],
  ["name", "Name"]
]
const validSorts = sortOptions.map(e => e[0])
const validDirs = ["asc", "desc"]
const defaultDir = sort => sort === "name" ? "asc" : "desc"

export default {
  config: {
    title: "Artists",
    description: "See the artists who have entered submissions for the splash art contests"
  },
  data: (req) => {
    const perPage = 48
    const sort = validSorts.includes(req.query.sort) ? req.query.sort : "votes"
    const direction = sort === "name" && validDirs.includes(req.query.dir) ? req.query.dir : defaultDir(sort)
    const search = (typeof req.query.search === "string" ? req.query.search : "").trim().slice(0, 64)
    const stats = db.artists.stats()
    const total = db.artists.count(search)
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const page = Math.max(1, Math.min(totalPages, Math.floor(Number(req.query.page)) || 1))
    const offset = (page - 1) * perPage

    const link = (overrides = {}) => {
      const params = { sort, dir: direction, search, page: 1, ...overrides }
      const query = new URLSearchParams()
      if (params.sort !== "votes") query.set("sort", params.sort)
      if (params.dir !== defaultDir(params.sort)) query.set("dir", params.dir)
      if (params.search) query.set("search", params.search)
      if (params.page > 1) query.set("page", params.page)
      const str = query.toString()
      return "/artists" + (str ? "?" + str : "")
    }

    const sorts = sortOptions.map(([key, label]) => ({
      key,
      label,
      active: key === sort,
      href: link({
        sort: key,
        dir: key === sort && key === "name" ? (direction === "desc" ? "asc" : "desc") : defaultDir(key)
      })
    }))

    const pagination = []
    if (totalPages > 1) {
      let last = 0
      for (let n = 1; n <= totalPages; n++) {
        if (n !== 1 && n !== totalPages && Math.abs(n - page) > 2) continue
        if (n - last === 2) pagination.push({ n: n - 1, href: link({ page: n - 1 }) })
        else if (n - last > 2) pagination.push({ gap: true })
        pagination.push({ n, href: link({ page: n }), current: n === page })
        last = n
      }
    }

    return {
      artists: db.artists.all(sort, direction, perPage, offset, search),
      sort,
      direction,
      search,
      page,
      totalPages,
      total,
      stats,
      sorts,
      link,
      pagination,
      rankStart: direction === "desc" && sort !== "name" && !search ? offset : null
    }
  },
  get(path, req, context) {
    if (path.length > 1) return
    const artist = db.artists.get(path[0])
    if (!artist) return
    const submissions = db.submissions.artist.all(artist.id)
    if (context.contest.status !== "finished" && req.user?.id !== artist.id) {
      const index = submissions.findIndex(e => e.contest.id === context.contest.id)
      if (index !== -1 ) submissions.splice(index, 1)
    }
    if (!submissions.length) return
    const votes = submissions.reduce((a, e) => a + e.votes, 0)
    const biggest = submissions.reduce((a, e) => a.votes > e.votes ? a : e)
    const banner = (artist.featured ? submissions.find(e => e.image === artist.featured) : null) ?? biggest
    const finished = context.contest.status === "finished" ? submissions : submissions.filter(e => e.contest.id !== context.contest.id)
    const trophies = {
      golds: finished.filter(e => e.position === 1).length,
      silvers: finished.filter(e => e.position === 2).length,
      bronzes: finished.filter(e => e.position === 3).length
    }
    return {
      view: "artist/index",
      styles: "artist/styles",
      script: "artist/script",
      context: {
        config: {
          title: `${artist.name} - Blockbench Splash Art Contests`,
          description: `${artist.name}'${artist.name.endsWith("s") ? "" : "s"} profile. ${votes.toLocaleString()} vote${votes === 1 ? "" : "s"} across ${submissions.length.toLocaleString()} submission${submissions.length === 1 ? "" : "s"}.`,
          image: `assets/images/submissions/${banner.contest.id}/${banner.image}_thumbnail_small.webp`
        },
        banner: `/assets/images/submissions/${banner.contest.id}/${banner.image}_thumbnail_large.webp`,
        artist,
        avatar: artist.avatarHash ? avatars.url(artist.id, artist.avatarHash) : null,
        submissions,
        votes,
        trophies,
        collabs: submissions.filter(e => e.artists.length > 1).length
      }
    }
  },
  pageList: () => db.artists.ids()
}
