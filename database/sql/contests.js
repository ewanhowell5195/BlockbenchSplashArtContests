database.exec(`
  CREATE TABLE IF NOT EXISTS contests (
    id INTEGER PRIMARY KEY,
    date INTEGER NOT NULL,
    open INTEGER,
    close INTEGER,
    vote INTEGER,
    finish INTEGER,
    version TEXT NOT NULL,
    name TEXT NOT NULL,
    theme TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'upcoming'
  )
`)

database.exec(`
  CREATE TRIGGER IF NOT EXISTS contest_check
  BEFORE INSERT ON contests
  BEGIN
    SELECT RAISE(ABORT, 'An unfinished contest already exists.')
    WHERE EXISTS (SELECT 1 FROM contests WHERE status != 'finished');
  END
`)

export default {
  add: prepareDBAction(`
    INSERT INTO contests (date, open, close, vote, finish, version, name, theme, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  all: prepareDBAction(`
    SELECT
      contests.*, 
      COUNT(submissions.contest) AS submissions,
      COALESCE(SUM(submissions.votes), 0) AS votes,
      (
        SELECT submissions.image
        FROM submissions
        WHERE submissions.contest = contests.id
        ORDER BY submissions.votes DESC
        LIMIT 1
      ) AS image
    FROM contests
    LEFT JOIN submissions ON contests.id = submissions.contest
    GROUP BY contests.id
    ORDER BY contests.id DESC
  `, "all"),
  get: prepareDBAction(`
    SELECT *
    FROM contests
    WHERE id = ?
  `, "get"),
  latest: prepareDBAction(`
    SELECT *
    FROM contests
    ORDER BY id DESC
    LIMIT 1
  `, "get"),
  mainImage: prepareDBAction(`
    WITH LatestContest AS (
      SELECT id, status
      FROM contests
      ORDER BY id DESC
      LIMIT 1
    )
    SELECT
      CASE
        WHEN c.status <> 'finished' THEN c.id
        ELSE s.contest
      END AS contest,
      CASE
        WHEN c.status = 'finished' THEN s.image
        ELSE NULL
      END AS image
    FROM LatestContest c
    LEFT JOIN (
      SELECT contest, image, MAX(votes) as max_votes
      FROM submissions
      WHERE contest = (SELECT id FROM LatestContest)
      GROUP BY contest, image
      ORDER BY max_votes DESC
      LIMIT 1
    ) s ON c.id = s.contest
  `, "get"),
  progress: prepareDBAction(`
    UPDATE contests
    SET status = CASE
      WHEN status = 'upcoming' THEN 'submissions'
      WHEN status = 'submissions' THEN 'reviewing'
      WHEN status = 'reviewing' THEN 'voting'
      WHEN status = 'voting' THEN 'finished'
      ELSE status
    END
    WHERE status != 'finished'
  `),
  regress: prepareDBAction(`
    UPDATE contests
    SET status = CASE
      WHEN status = 'submissions' THEN 'upcoming'
      WHEN status = 'reviewing' THEN 'submissions'
      WHEN status = 'voting' THEN 'reviewing'
      ELSE status
    END
    WHERE status != 'finished'
  `),
  ids: prepareDBAction(`
    SELECT id
    FROM contests
  `, "all", null, o => o.map(e => e.id))
}