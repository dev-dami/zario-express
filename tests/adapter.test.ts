import { describe, expect, test } from "bun:test";
import express from "express";
import express4 from "express4";
import request from "supertest";
import { zario } from "zario";
import { expressLogger } from "../src/index.js";

function fixture() {
  const logs: Record<string, unknown>[] = [];
  const logger = zario({
    json: true,
    timestamp: false,
    transports: [
      {
        write(data, formatter) {
          logs.push(JSON.parse(formatter.format(data)));
        },
      },
    ],
  });
  return { logs, logger };
}

describe("Express adapter on Bun", () => {
  test("Express 5 attaches req.log and emits one completion without query secrets", async () => {
    const { logger, logs } = fixture();
    const app = express();
    app.use(expressLogger({ logger, requestId: () => "req-123" }));
    app.get("/", (req, res) => {
      req.log.info("handled");
      res.json({ requestId: req.requestId });
    });
    const response = await request(app).get("/?token=secret");
    expect(response.body.requestId).toBe("req-123");
    expect(logs).toHaveLength(2);
    expect(logs[1]).toMatchObject({
      method: "GET",
      path: "/",
      status: 200,
      requestId: "req-123",
      aborted: false,
    });
    expect(JSON.stringify(logs)).not.toContain("secret");
    await logger.close();
  });

  test("Express 4 supports custom levels and excluded paths still have a logger", async () => {
    const { logger, logs } = fixture();
    const app = express4();
    app.use(
      expressLogger({ logger, level: "fatal", excludePaths: ["/health"] }),
    );
    app.get("/health", (req, res) => res.json({ hasLogger: Boolean(req.log) }));
    app.get("/fail", (_req, res) => res.sendStatus(500));
    expect((await request(app).get("/health")).body.hasLogger).toBe(true);
    expect(logs).toHaveLength(0);
    await request(app).get("/fail");
    expect(logs[0]).toMatchObject({ level: "fatal", status: 500 });
    await logger.close();
  });

  test("concurrent requests receive independent context", async () => {
    const { logger, logs } = fixture();
    const app = express();
    app.use(expressLogger({ logger }));
    app.get("/", (_req, res) => res.sendStatus(200));
    await Promise.all([request(app).get("/"), request(app).get("/")]);
    expect(logs).toHaveLength(2);
    expect(logs[0]?.requestId).not.toBe(logs[1]?.requestId);
    await logger.close();
  });

  test("aborted responses emit one error record", async () => {
    const { logger, logs } = fixture();
    const app = express();
    app.use(expressLogger({ logger }));
    app.get("/abort", (req) => {
      req.socket.destroy();
    });
    await expect(Promise.resolve(request(app).get("/abort"))).rejects.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ aborted: true, level: "error" });
    await logger.close();
  });
});
