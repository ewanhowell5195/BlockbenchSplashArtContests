database.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER,
    contestId INTEGER,
    artists TEXT DEFAULT '[]',
    votes INTEGER DEFAULT 0,
    PRIMARY KEY (id, contestId),
    FOREIGN KEY(contestId) REFERENCES contests(id)
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
      WHERE submissions.contestId = NEW.contestId
    );
  END
`)

export default {
  add: prepareDBAction(`
    INSERT INTO submissions (id, contestId, artists, votes)
    VALUES (COALESCE((SELECT MAX(id) + 1 FROM submissions WHERE contestId = ?), 0), ?, json(?), ?)
  `, "run", (id, artists, votes) => [id, id, JSON.stringify(artists), votes]),
  latest: prepareDBAction(`
    SELECT *
    FROM submissions
    WHERE contestId = ?
    ORDER BY id DESC
    LIMIT 1
  `, "get"),
  contest: prepareDBAction(`
    SELECT *
    FROM submissions
    WHERE contestId = ?
    ORDER BY votes DESC
  `, "all")
}