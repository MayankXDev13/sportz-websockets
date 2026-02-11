import WebSocket, { WebSocketServer } from "ws";
import type { Server } from "http";

function sendJson(socket: WebSocket, payload: any) {
  if (socket.readyState === WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcast(wss: WebSocketServer, payload: any) {
  for (const client of wss.clients) {
    sendJson(client, payload);
  }
}

export function attachWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket, req) => {
    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  function broadcastMatchCreated(match: any) {
    broadcast(wss, { type: "match_created", data: match });
  }
  return {
    broadcastMatchCreated,
  };
}
