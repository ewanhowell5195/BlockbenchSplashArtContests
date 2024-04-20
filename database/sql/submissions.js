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
    SELECT RAISE(ABORT, 'An artist in the list already exists in another submission for this contest')
    WHERE EXISTS (
      SELECT 1 FROM submissions
      JOIN json_each(submissions.artists) as existing_artists
      JOIN json_each(NEW.artists) as new_artists
      ON existing_artists.value = new_artists.value
      WHERE submissions.contest = NEW.contest
    );
  END
`)

export default {
  add: prepareDBAction(`
    INSERT INTO submissions (id, contest, artists, votes)
    VALUES (COALESCE((SELECT MAX(id) + 1 FROM submissions WHERE contest = ?), 0), ?, json(?), ?)
  `, "run", (id, artists, votes) => [id, id, JSON.stringify(artists), votes]),
  latest: prepareDBAction(`
    SELECT *
    FROM submissions
    WHERE contest = ?
    ORDER BY id DESC
    LIMIT 1
  `, "get"),
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
  }))
}