globalThis.prepareDBAction = (action, run = "run", input = null, output = null) => {
  const prep = database.prepare(action)
  if (output) return (...args) => {
    if (input) args = input(...args)
    return output(prep[run](...args))
  }
  else return (...args) => {
    if (input) args = input(...args)
    return prep[run](...args)
  }
}

database.pragma("journal_mode = WAL")

export default {
  events: (await import("./sql/events.js")).default,
  artists: (await import("./sql/artists.js")).default,
  contests: (await import("./sql/contests.js")).default,
  submissions: (await import("./sql/submissions.js")).default
}