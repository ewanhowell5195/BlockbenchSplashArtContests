import ExpressWs from "express-ws"

const expressWs = ExpressWs(app, process.argv.includes("-dev") ? undefined : globalThis.server)
const wsInstance = expressWs.getWss(app)

globalThis.sendWs = content => Promise.all(Array.from(wsInstance.clients).map(client => new Promise(resolve => client.send(JSON.stringify(content), resolve))))

app.ws("/websocket", () => {})

setInterval(() => {
  sendWs({ type: "ping" })
}, 10000)