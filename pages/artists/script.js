const results = document.getElementById("artist-results")
const searchForm = document.getElementById("artist-search")
const searchInput = searchForm.querySelector("input[name=search]")
const sortChips = Array.from(document.querySelectorAll("#sort-options a"))

const perPage = 48
const validSorts = ["votes", "wins", "submissions", "name"]
const defaultDir = sort => sort === "name" ? "asc" : "desc"

let artists = null
let loading = null

function parseState(params) {
  const sort = validSorts.includes(params.get("sort")) ? params.get("sort") : "votes"
  return {
    sort,
    dir: sort === "name" && ["asc", "desc"].includes(params.get("dir")) ? params.get("dir") : defaultDir(sort),
    search: (params.get("search") ?? "").trim().slice(0, 64),
    page: Math.max(1, Math.floor(Number(params.get("page"))) || 1)
  }
}

let state = parseState(new URLSearchParams(location.search))

function buildLink(s) {
  const query = new URLSearchParams()
  if (s.sort !== "votes") query.set("sort", s.sort)
  if (s.dir !== defaultDir(s.sort)) query.set("dir", s.dir)
  if (s.search) query.set("search", s.search)
  if (s.page > 1) query.set("page", s.page)
  const str = query.toString()
  return "/artists" + (str ? "?" + str : "")
}

function loadArtists() {
  loading ??= fetch("/api/artists/list").then(r => {
    if (!r.ok) throw new Error(r.status)
    return r.json()
  }).then(data => artists = data).catch(e => {
    loading = null
    throw e
  })
  return loading
}

const nameCompare = (a, b) => {
  const x = a.name.toLowerCase()
  const y = b.name.toLowerCase()
  return x < y ? -1 : x > y ? 1 : 0
}

const sorters = {
  votes: m => (a, b) => m * (b.votes - a.votes) || b.submissions - a.submissions || nameCompare(a, b),
  submissions: m => (a, b) => m * (b.submissions - a.submissions) || b.votes - a.votes || nameCompare(a, b),
  wins: m => (a, b) => m * (b.golds - a.golds) || m * (b.silvers - a.silvers) || m * (b.bronzes - a.bronzes) || m * (b.votes - a.votes) || nameCompare(a, b),
  name: m => (a, b) => -m * nameCompare(a, b)
}

const escapeHTML = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

function trophyPill(count, index, label) {
  if (!count) return ""
  return `<span class="trophy-pill" title="${count.toLocaleString()}x ${label}"><img src="/assets/images/icons/trophy_${index}.png" width="18" height="18" alt="${label} trophy">${count.toLocaleString()}</span>`
}

function renderCard(artist, rank) {
  const name = escapeHTML(artist.name)
  return `<a class="artist-card panel" href="/artists/${artist.id}">
    <div class="artist-banner">
      <img src="/assets/images/submissions/${artist.contest}/${artist.image}_thumbnail_small.webp" alt="Splash art by ${name}" loading="lazy">
      ${rank ? `<span class="artist-rank${rank <= 3 ? " rank-" + rank : ""}">#${rank.toLocaleString()}</span>` : ""}
      <div class="artist-trophies">
        ${trophyPill(artist.golds, 0, "1st place")}
        ${trophyPill(artist.silvers, 1, "2nd place")}
        ${trophyPill(artist.bronzes, 2, "3rd place")}
      </div>
    </div>
    <div class="artist-avatar">
      <img src="${artist.avatar ?? "/assets/images/branding/default_avatar.webp"}" width="64" height="64" alt="" loading="lazy">
    </div>
    <div class="artist-info">
      <span class="artist-stats">
        <span title="${artist.votes.toLocaleString()} vote${artist.votes === 1 ? "" : "s"}"><img src="/assets/images/icons/like.png" width="16" height="16" alt="Votes">${artist.votes.toLocaleString()}</span>
        <span title="${artist.submissions.toLocaleString()} submission${artist.submissions === 1 ? "" : "s"}"><span class="icon">image</span>${artist.submissions.toLocaleString()}</span>
      </span>
      <span class="artist-name" title="${name}">${name}</span>
    </div>
  </a>`
}

function renderPagination(totalPages) {
  if (totalPages <= 1) return ""
  const parts = []
  if (state.page > 1) parts.push(`<a class="page-chip" href="${buildLink({ ...state, page: state.page - 1 })}" aria-label="Previous page"><span class="icon">chevron_left</span></a>`)
  let last = 0
  for (let n = 1; n <= totalPages; n++) {
    if (n !== 1 && n !== totalPages && Math.abs(n - state.page) > 2) continue
    if (n - last === 2) parts.push(`<a class="page-chip" href="${buildLink({ ...state, page: n - 1 })}">${n - 1}</a>`)
    else if (n - last > 2) parts.push(`<span class="page-gap">…</span>`)
    parts.push(n === state.page ? `<a class="page-chip current" href="${buildLink({ ...state, page: n })}">${n}</a>` : `<a class="page-chip" href="${buildLink({ ...state, page: n })}">${n}</a>`)
    last = n
  }
  if (state.page < totalPages) parts.push(`<a class="page-chip" href="${buildLink({ ...state, page: state.page + 1 })}" aria-label="Next page"><span class="icon">chevron_right</span></a>`)
  return `<div id="pagination">${parts.join("")}</div>`
}

function renderToolbar() {
  if (document.activeElement !== searchInput) searchInput.value = state.search
  for (const chip of sortChips) {
    const key = chip.dataset.key
    const active = key === state.sort
    chip.classList.toggle("active", active)
    chip.href = buildLink({
      ...state,
      sort: key,
      dir: active && key === "name" ? (state.dir === "desc" ? "asc" : "desc") : defaultDir(key),
      page: 1
    })
    const icon = chip.querySelector(".sort-icon")
    if (active && key === "name") {
      if (icon) icon.textContent = state.dir === "asc" ? "arrow_upward" : "arrow_downward"
      else chip.insertAdjacentHTML("beforeend", `<span class="icon sort-icon">${state.dir === "asc" ? "arrow_upward" : "arrow_downward"}</span>`)
    } else if (icon) {
      icon.remove()
    }
  }
  let clear = document.getElementById("clear-search")
  if (state.search) {
    if (!clear) {
      searchForm.querySelector("button").insertAdjacentHTML("beforebegin", `<a id="clear-search" title="Clear search" aria-label="Clear search"><span class="icon">close</span></a>`)
      clear = document.getElementById("clear-search")
    }
    clear.href = buildLink({ ...state, search: "", page: 1 })
  } else if (clear) {
    clear.remove()
  }
}

function render() {
  const search = state.search.toLowerCase()
  const filtered = search ? artists.filter(e => e.name.toLowerCase().includes(search)) : artists.slice()
  filtered.sort(sorters[state.sort](state.dir === "desc" ? 1 : -1))
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  state.page = Math.min(state.page, totalPages)
  const offset = (state.page - 1) * perPage
  const pageArtists = filtered.slice(offset, offset + perPage)
  const ranked = state.dir === "desc" && state.sort !== "name" && !state.search

  renderToolbar()

  if (pageArtists.length) {
    results.innerHTML = `<div id="artist-list">${pageArtists.map((e, i) => renderCard(e, ranked ? offset + i + 1 : 0)).join("")}</div>${renderPagination(totalPages)}`
  } else {
    results.innerHTML = `<div id="no-artists" class="panel">
      <h3>No artists found</h3>
      <p>No artists match "${escapeHTML(state.search)}".</p>
      <a class="button" href="${buildLink({ ...state, search: "", page: 1 })}"><span class="icon">close</span>Clear search</a>
    </div>`
  }
}

async function apply(newState, push) {
  const target = buildLink(newState)
  try {
    await loadArtists()
  } catch {
    location.href = target
    return
  }
  state = newState
  render()
  if (push) history.pushState(null, "", buildLink(state))
}

document.addEventListener("click", e => {
  const link = e.target.closest("#sort-options a, #pagination a, #clear-search, #no-artists a")
  if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  const newState = parseState(new URL(link.href, location.origin).searchParams)
  const changingPage = newState.page !== state.page && newState.sort === state.sort && newState.dir === state.dir && newState.search === state.search
  apply(newState, true).then(() => {
    if (changingPage) window.scrollTo(0, 0)
  })
})

let searchTimeout

searchForm.addEventListener("submit", e => {
  e.preventDefault()
  clearTimeout(searchTimeout)
  apply({ ...state, search: searchInput.value.trim().slice(0, 64), page: 1 }, true)
})

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const search = searchInput.value.trim().slice(0, 64)
    if (search !== state.search) apply({ ...state, search, page: 1 }, true)
  }, 1000)
})

window.addEventListener("popstate", () => {
  apply(parseState(new URLSearchParams(location.search)), false)
})