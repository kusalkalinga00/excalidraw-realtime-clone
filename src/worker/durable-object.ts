import { DurableObject } from "cloudflare:workers";

export class ExcalidrawWebSocketServer extends DurableObject {
  count = 0;

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    ws.send(
      `[Durable Object] message: ${message}, connections: ${
        this.ctx.getWebSockets().length
      }`
    );
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    // this.sessions.delete(ws);
    ws.close(code, "Durable Object is closing WebSocket");
  }

  // async webSocketError(ws: WebSocket, error: Error): Promise<void> {}

  // async webSocketOpen(ws: WebSocket): Promise<void> {}
}
