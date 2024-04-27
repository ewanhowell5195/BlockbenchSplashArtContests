database.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER,
    contest INTEGER,
    artists TEXT DEFAULT '[]',
    votes INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    PRIMARY KEY (id, contest),
    FOREIGN KEY(contest) REFERENCES contests(id)
  )
`)

database.exec(`
  CREATE TRIGGER IF NOT EXISTS artist_check
  BEFORE INSERT ON submissions
  FOR EACH ROW
  BEGIN
    SELECT RAISE(ABORT, 'One or more artists do not exist in the artists table')
    WHERE NOT EXISTS (
      SELECT 1
      FROM json_each(NEW.artists)
      WHERE json_each.value IN (SELECT id FROM artists)
    );
  END
`)

export default {
  add: prepareDBAction(`
    INSERT INTO submissions (id, contest, artists, image)
    VALUES (COALESCE((SELECT MAX(id) + 1 FROM submissions WHERE contest = ?), 0), ?, json(?), ?)
  `, "run", (id, artists, image) => [id, id, JSON.stringify(artists), image]),
  delete: prepareDBAction(`
    DELETE FROM submissions
    WHERE id = ? AND contest = ?
  `),
  contest: prepareDBAction(`
    SELECT
      s.id,
      s.contest,
      json_group_array(
        json_object(
          'id', a.id,
          'name', a.name,
          'socialMedia', a.socialMedia
        )
      ) as artists,
      s.votes,
      s.image
    FROM submissions s,
    json_each(s.artists) j
    JOIN artists a ON a.id = j.value
    WHERE s.contest = ?
    GROUP BY s.id, s.contest, s.votes, s.image
    ORDER BY s.votes DESC
  `, "all", null, o => o.map(e => {
    e.artists = JSON.parse(e.artists)
    return e
  })),
  invites: {
    get: prepareDBAction(`
      SELECT json_extract(data, '$.invite') as invite
      FROM events
      WHERE type = 'invite'
        AND json_extract(data, '$.submission') = ?
        AND json_extract(data, '$.contest') = ?
    `, "get", null, o => o?.invite),
    getCode: prepareDBAction(`
      SELECT data
      FROM events
      WHERE type = 'invite'
        AND json_extract(data, '$.invite') = ?
    `, "get", null, o => {
      if (o) o = JSON.parse(o.data)
      return o
    }),
    getAllowed: prepareDBAction(`
      SELECT s.*
      FROM submissions s
      JOIN contests c ON s.contest = c.id
      WHERE json_extract(s.artists, '$[0]') = ?
        AND json_array_length(s.artists) = 1
        AND c.status = 'submissions'
        AND NOT EXISTS (
          SELECT 1
          FROM events e
          WHERE e.type = 'invite'
            AND json_extract(e.data, '$.submission') = s.id
            AND json_extract(e.data, '$.contest') = s.contest
        )
    `, "get"),
    delete: prepareDBAction(`
      DELETE FROM events
      WHERE type = 'invite'
        AND json_extract(data, '$.submission') = ?
        AND json_extract(data, '$.contest') = ?
    `)
  }
}