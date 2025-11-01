import { DurableObject } from "cloudflare:workers";

export class ExcalidrawWebSocketServer extends DurableObject {
  sessions: Map<WebSocket, { [key: string]: string }>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();

    this.ctx.getWebSockets().forEach((ws) => {
      let attachment = ws.deserializeAttachment();
      if (attachment) {
        this.sessions.set(ws, { ...attachment });
      }
    });

    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong")
    );
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

    const id = crypto.randomUUID();
    server.serializeAttachment({ id });
    this.sessions.set(server, { id });

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    const session = this.sessions.get(ws)!;

    ws.send(
      `[Durable Object] message: ${message}, from: ${session.id}, to: the initiating client. Total connectionss: ${this.sessions.size}`
    );

    this.sessions.forEach((attachment, connectedWs) => {
      connectedWs.send(
        `[Durable Object] message: ${message}, from: ${session.id}, to: all clients. Total connections: ${this.sessions.size}`
      );
    });
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    // this.sessions.delete(ws);
    this.sessions.delete(ws);
    ws.close(code, "Durable Object is closing WebSocket");
  }

  // async webSocketError(ws: WebSocket, error: Error): Promise<void> {}

  // async webSocketOpen(ws: WebSocket): Promise<void> {}
}
