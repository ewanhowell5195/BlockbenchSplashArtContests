database.exec(`
  CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    socialMedia TEXT,
    bio TEXT,
    featured TEXT,
    avatarHash TEXT
  )
`)

const listQuery = order => `
  WITH finished AS (
    SELECT
      s.contest,
      s.image,
      s.votes,
      s.artists,
      (
        SELECT COUNT(*)
        FROM submissions s2
        WHERE s2.contest = s.contest AND s2.votes > s.votes
      ) + 1 AS position
    FROM submissions s
    JOIN contests c ON c.id = s.contest AND c.status = 'finished'
  )
  SELECT
    a.id,
    a.name,
    a.avatarHash,
    COUNT(*) AS submissions,
    SUM(f.votes) AS votes,
    SUM(f.position = 1) AS golds,
    SUM(f.position = 2) AS silvers,
    SUM(f.position = 3) AS bronzes,
    COALESCE(
      (
        SELECT f2.image || ',' || f2.contest
        FROM finished f2
        WHERE f2.image = a.featured AND EXISTS (
          SELECT 1 FROM json_each(f2.artists) WHERE json_each.value = a.id
        )
      ),
      (
        SELECT f2.image || ',' || f2.contest
        FROM finished f2
        WHERE EXISTS (
          SELECT 1 FROM json_each(f2.artists) WHERE json_each.value = a.id
        )
        ORDER BY f2.votes DESC
        LIMIT 1
      )
    ) AS preview
  FROM artists a
  JOIN finished f ON EXISTS (
    SELECT 1 FROM json_each(f.artists) WHERE json_each.value = a.id
  )
  WHERE instr(LOWER(a.name), LOWER(?)) > 0
  GROUP BY a.id
  ORDER BY ${order}
  LIMIT ? OFFSET ?
`

const sortOrders = {
  votes: dir => `votes ${dir}, submissions DESC, LOWER(a.name) ASC`,
  submissions: dir => `submissions ${dir}, votes DESC, LOWER(a.name) ASC`,
  wins: dir => `golds ${dir}, silvers ${dir}, bronzes ${dir}, votes ${dir}, LOWER(a.name) ASC`,
  name: dir => `LOWER(a.name) ${dir}`
}

const listStatements = {}
for (const [key, order] of Object.entries(sortOrders)) {
  listStatements[key] = {
    desc: database.prepare(listQuery(order("DESC")))
  }
  if (key === "name") {
    listStatements[key].asc = database.prepare(listQuery(order("ASC")))
  }
}

const countStatement = database.prepare(`
  SELECT COUNT(*) AS total
  FROM artists a
  WHERE instr(LOWER(a.name), LOWER(?)) > 0
    AND EXISTS (
      SELECT 1
      FROM submissions s
      JOIN contests c ON c.id = s.contest AND c.status = 'finished'
      WHERE EXISTS (
        SELECT 1 FROM json_each(s.artists) WHERE json_each.value = a.id
      )
    )
`)

export default {
  add: prepareDBAction(`
    INSERT INTO artists (id, name, socialMedia)
    VALUES (?, ?, ?)
    ON CONFLICT (id) DO NOTHING
  `),
  get: prepareDBAction(`
    SELECT *
    FROM artists
    WHERE id = ?
  `, "get"),
  update: prepareDBAction(`
    UPDATE artists
    SET name = ?, socialMedia = ?, bio = ?
    WHERE id = ?
  `, "run", (id, name, socialMedia, bio) => [name, socialMedia ?? null, bio ?? null, id]),
  setFeatured: prepareDBAction(`
    UPDATE artists
    SET featured = ?
    WHERE id = ?
  `, "run", (id, featured) => [featured ?? null, id]),
  setAvatar: prepareDBAction(`
    UPDATE artists
    SET avatarHash = ?
    WHERE id = ?
  `, "run", (id, hash) => [hash ?? null, id]),
  reconcileAvatars(fileMap) {
    const ids = Object.keys(fileMap)
    const present = new Set()
    if (ids.length) {
      const ph = ids.map(() => "?").join(",")
      for (const row of database.prepare(`SELECT id FROM artists WHERE id IN (${ph})`).all(...ids)) {
        present.add(row.id)
      }
    }
    const update = database.prepare("UPDATE artists SET avatarHash = ? WHERE id = ? AND (avatarHash IS NULL OR avatarHash != ?)")
    for (const id of present) {
      update.run(fileMap[id], id, fileMap[id])
    }
    if (present.size) {
      const ph = [...present].map(() => "?").join(",")
      database.prepare(`UPDATE artists SET avatarHash = NULL WHERE avatarHash IS NOT NULL AND id NOT IN (${ph})`).run(...present)
    } else {
      database.prepare("UPDATE artists SET avatarHash = NULL WHERE avatarHash IS NOT NULL").run()
    }
    return ids.filter(id => !present.has(id))
  },
  all(sort = "votes", direction = "desc", limit = 48, offset = 0, search = "") {
    const stmt = listStatements[sort]?.[direction] ?? listStatements.votes.desc
    return stmt.all(search, limit, offset).map(e => {
      if (e.preview) {
        const [image, contest] = e.preview.split(",")
        e.image = image
        e.contest = Number(contest)
      }
      delete e.preview
      e.avatar = e.avatarHash ? avatars.url(e.id, e.avatarHash) : null
      delete e.avatarHash
      return e
    })
  },
  count: search => countStatement.get(search ?? "").total,
  stats: prepareDBAction(`
    SELECT
      (
        SELECT COUNT(*)
        FROM artists a
        WHERE EXISTS (
          SELECT 1
          FROM submissions s2
          JOIN contests c2 ON c2.id = s2.contest AND c2.status = 'finished'
          WHERE EXISTS (
            SELECT 1 FROM json_each(s2.artists) WHERE json_each.value = a.id
          )
        )
      ) AS artists,
      COUNT(*) AS submissions,
      COALESCE(SUM(s.votes), 0) AS votes,
      COUNT(DISTINCT s.contest) AS contests,
      (
        SELECT COUNT(DISTINCT je.value)
        FROM submissions s2
        JOIN contests c2 ON c2.id = s2.contest AND c2.status = 'finished'
        JOIN json_each(s2.voters) je
      ) AS knownVoters,
      (
        SELECT COALESCE(SUM(s2.votes), 0)
        FROM submissions s2
        JOIN contests c2 ON c2.id = s2.contest AND c2.status = 'finished'
        WHERE s2.contest IN (
          SELECT DISTINCT s3.contest FROM submissions s3 WHERE json_array_length(s3.voters) > 0
        )
      ) AS knownVotes,
      (
        SELECT COUNT(DISTINCT je.value)
        FROM submissions s2
        JOIN contests c2 ON c2.id = s2.contest AND c2.status = 'finished'
        JOIN json_each(s2.artists) je
        WHERE s2.votes = (SELECT MAX(s3.votes) FROM submissions s3 WHERE s3.contest = s2.contest)
      ) AS champions,
      (
        SELECT MIN(c2.date)
        FROM contests c2
        WHERE c2.status = 'finished'
      ) AS started
    FROM submissions s
    JOIN contests c ON c.id = s.contest AND c.status = 'finished'
  `, "get"),
  ids: prepareDBAction(`
    SELECT id
    FROM artists a
    WHERE EXISTS (
      SELECT 1
      FROM submissions s
      JOIN contests c ON c.id = s.contest AND c.status = 'finished'
      WHERE EXISTS (
        SELECT 1 FROM json_each(s.artists) WHERE json_each.value = a.id
      )
    )
  `, "all", null, o => o.map(e => e.id))
}
