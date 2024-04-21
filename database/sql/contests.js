database.exec(`
  CREATE TABLE IF NOT EXISTS contests (
    id INTEGER PRIMARY KEY,
    date INTEGER NOT NULL,
    version TEXT NOT NULL,
    name TEXT NOT NULL,
    theme TEXT NOT NULL,
    description TEXT
  )
`)

export default {
  add: prepareDBAction(`
    INSERT INTO contests (id, date, version, name, theme, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  all: prepareDBAction(`
    SELECT *
    FROM contests
    ORDER BY id DESC
  `, "all"),
  get: prepareDBAction(`
    SELECT *
    FROM contests
    WHERE id = ?
  `, "get")
}