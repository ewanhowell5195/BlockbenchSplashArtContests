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
    SELECT
      contests.*, 
      COUNT(submissions.contest) AS submissions,
      SUM(submissions.votes) AS votes,
      (
        SELECT submissions.image
        FROM submissions
        WHERE submissions.contest = contests.id
        ORDER BY submissions.votes DESC
        LIMIT 1
      ) AS image
    FROM contests
    JOIN submissions ON contests.id = submissions.contest
    GROUP BY contests.id
    ORDER BY contests.id DESC
  `, "all"),
  get: prepareDBAction(`
    SELECT *
    FROM contests
    WHERE id = ?
  `, "get")
}