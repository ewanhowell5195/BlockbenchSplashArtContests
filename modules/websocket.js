import ExpressWs from "express-ws"

const expressWs = ExpressWs(app)
const wsInstance = expressWs.getWss(app)

globalThis.sendWs = content => Promise.all(Array.from(wsInstance.clients).map(client => new Promise(resolve => client.send(JSON.stringify(content), resolve))))

app.ws("/websocket", () => {})