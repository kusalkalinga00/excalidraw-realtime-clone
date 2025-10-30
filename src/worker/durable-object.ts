import { DurableObject } from "cloudflare:workers";

export class ExcalidrawWebSocketServer extends DurableObject {
  count = 0;

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  async increment() {
    this.count += 1;
    return this.count;
  }
}
