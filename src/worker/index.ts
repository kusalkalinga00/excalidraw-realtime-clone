import { Hono } from "hono";
export { ExcalidrawWebSocketServer } from "./durable-object";

const app = new Hono<{ Bindings: Env }>();

app.get("/api", async (c) => {
  const id = c.env.DURABLE_OBJECT.idFromName("test-name");
  const stub = c.env.DURABLE_OBJECT.get(id);
  const count = await stub.increment();
  console.log("Count:", count);
  return c.json({ count });
});

export default app;
