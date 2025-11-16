import { DurableObject } from "cloudflare:workers";
import {
  BufferEvent,
  ExcalidrawElementChangeSchema,
} from "../types/event.schema";

export class ExcalidrawWebSocketServer extends DurableObject {
  elements: any[] = [];

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.elements = (await ctx.storage.get("elements")) || [];
    });
  }

  async fetch(): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    if (message === "setup") {
      ws.send(
        JSON.stringify(
          ExcalidrawElementChangeSchema.parse({
            type: "elementChange",
            data: this.elements,
          })
        )
      );
      return;
    }

    this.broadcastMsg(ws, message);
  }

  webSocketClose() {
    console.log("WebSocket closed");
  }

  webSocketError(error: unknown): void | Promise<void> {
    console.log("Error:", error);
  }

  broadcastMsg(ws: WebSocket, message: string | ArrayBuffer) {
    for (const session of this.ctx.getWebSockets()) {
      if (session !== ws) {
        session.send(message);
      }
    }
    if (typeof message === "string") {
      const event = BufferEvent.parse(JSON.parse(message));
      if (event.type === "elementChange") {
        this.elements = event.data;
        this.ctx.storage.put("elements", this.elements);
      }
    }
  }

  async getElements() {
    return {
      data: this.elements,
    };
  }
}
