export default {
  post: {
    admin: true,
    arguments: {
      sql: {
        required: true
      }
    },
    execute(req, res) {
      try {
        const r = database.prepare(req.body.sql)[req.body.sql.includes("INSERT") || req.body.sql.includes("UPDATE") ? "run" : "all"]()
        res.send(r)
      } catch (err) {
        res.status(500).send(err.message)
      }
    }
  }
}