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
    ON CONFLICT (id) DO NOTHING
  `),
  get: prepareDBAction(`
    SELECT *
    FROM artists
    WHERE id = ?
  `, "get"),
  update: prepareDBAction(`
    UPDATE artists
    SET name = ?, socialMedia = ?
    WHERE id = ?
  `, "run", (id, name, socialMedia) => [name, socialMedia, id]),
  submission: prepareDBAction(`
    SELECT *
    FROM submissions
    WHERE contest = ?
    AND EXISTS (
      SELECT 1
      FROM json_each(submissions.artists) as artist
      WHERE artist.value = ?
    )
  `, "get")
}