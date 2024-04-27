let processingEvents
globalThis.eventHandler = () => {
  if (processingEvents) return 
  processingEvents = true
  clearTimeout(globalThis.currentEvent)
  const now = Date.now()
  const finished = db.events.finished(now)
  db.events.deleteFinished(now)
  const next = db.events.next()
  if (next) globalThis.currentEvent = setTimeout(eventHandler, Math.min(next - Date.now(), 2147483647))
  processingEvents = false
}