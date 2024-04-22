export default {
  post: {
    upload: {
      field: "submission",
      destination: async (req, file, next) => {
        const contest = db.contests.latest()
        const folder = "assets/images/submissions/" + contest.id
        await fs.promises.mkdir(folder, { recursive: true })
        next(null, folder)
      },
      name: (req, file, next) => {
        next(null, "temp-" + Date.now())
      },
      filter: (req, file, next) => {
        if (file.mimetype === "image/png") {
          next(null, true)
        } else {
          next(null, false, new Error("Only PNG files are allowed"))
        }
      }
    },
    async execute(req, res) {
      console.log(createHash)
      const hash = createHash("sha256")
      const buffer = await fs.promises.readFile(req.file.path)
      hash.update(buffer)
      const hex = hash.digest("hex")
      const newFilename = `${hex}.png`
      const newPath = path.join(req.file.destination, newFilename)
      await fs.promises.rename(req.file.path, newPath)
      res.sendStatus(200)
    }
  }
}