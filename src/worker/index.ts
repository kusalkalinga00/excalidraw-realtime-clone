import { Hono } from "hono";
export { ExcalidrawWebSocketServer } from "./durable-object";

const app = new Hono<{ Bindings: Env }>();

app.get("/api", async (c) => {
  const id = c.env.DURABLE_OBJECT.idFromName("test-name");
  const stub = c.env.DURABLE_OBJECT.get(id);
  // const count = await stub.increment();
  // console.log("Count:", count);
  // return c.json({ count });
});

app.get("/api/ws/:drawingId", async (c) => {
  const drawingId = c.req.param("drawingId");
  const upgradeHeader = c.req.header("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return c.text("Expected Upgrade: websocket", 400);
  }

  const id = c.env.DURABLE_OBJECT.idFromName(drawingId);
  const stub = c.env.DURABLE_OBJECT.get(id);

  return stub.fetch(c.req.raw);
});

export default app;
