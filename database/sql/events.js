database.prepare(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    end INTEGET NOT NULL,
    data TEXT
  )
`).run()

export default {
  add: prepareDBAction(`
    INSERT INTO events (type, end, data)
    VALUES (?, ?, ?)
  `, "run", (type, end, data) => [type, end, data ? JSON.stringify(data) : undefined], o => {
    eventHandler()
    return o
  }),
  finished: prepareDBAction(`
    SELECT *
    FROM events
    WHERE end < ?
  `, "all"),
  deleteFinished: prepareDBAction(`
    DELETE FROM events
    WHERE end < ?
  `),
  next: prepareDBAction(`
    SELECT MIN(end)
    FROM events
  `, "get", null, o => o["MIN(end)"])
}