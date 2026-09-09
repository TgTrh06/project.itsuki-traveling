import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";

beforeAll(() => {
  process.env.MONGO_URI = "mongodb://127.0.0.1:27017/itsuki-no-tabi-test";
  process.env.JWT_SECRET = "test-secret";
  process.env.MAILTRAP_TOKEN = "test-token";
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.NODE_ENV = "test";
});

describe("application factory", () => {
  it("serves the health endpoint without opening a database connection", async () => {
    await request(createApp()).get("/").expect(200, "Itsuki no Tabi API Running 🗾");
  });

  it("uses the standard not-found error response", async () => {
    const response = await request(createApp()).get("/missing").expect(404);
    expect(response.body).toMatchObject({ success: false, code: "NOT_FOUND" });
  });
});
