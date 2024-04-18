database.exec(`
  CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    socialMedia TEXT
  )
`)

export default {
  add: prepareDBAction(`
    INSERT INTO artists (id, name, socialMedia)
    VALUES (?, ?, ?)
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name, socialMedia = EXCLUDED.socialMedia
  `),
  get: prepareDBAction(`
    SELECT *
    FROM artists
    WHERE id = ?
  `, "get")
}