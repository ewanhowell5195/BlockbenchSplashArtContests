import ExpressWs from "express-ws"

globalThis.startWs = () => {
  const expressWs = ExpressWs(app, globalThis.server)
  const wsInstance = expressWs.getWss(app)

  globalThis.sendWs = content => Promise.all(Array.from(wsInstance.clients).map(client => new Promise(resolve => client.send(JSON.stringify(content), resolve))))

  app.ws("/websocket", () => {})
}
