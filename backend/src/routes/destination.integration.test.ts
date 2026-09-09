import type { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Destination } from "../models/destination.model.js";

let mongo: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = "integration-test-secret";
  process.env.MAILTRAP_TOKEN = "integration-test-token";
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.NODE_ENV = "test";
  await mongoose.connect(mongo.getUri());
  const { createApp } = await import("../app.js");
  app = createApp();
}, 60_000);

beforeEach(async () => {
  await Destination.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("destination API integration", () => {
  it("returns paginated destinations from MongoDB", async () => {
    await Destination.create({ title: "Tokyo", slug: "tokyo", svgId: "JP-13", articles: [] });

    const response = await request(app).get("/api/destinations?page=1&limit=10").expect(200);

    expect(response.body).toMatchObject({ total: 1, page: 1, pages: 1 });
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({ title: "Tokyo", slug: "tokyo", articleCount: 0 });
  });

  it("returns the consistent not-found error contract", async () => {
    const response = await request(app).get("/api/not-a-route").expect(404);
    expect(response.body).toMatchObject({ success: false, code: "NOT_FOUND" });
  });
});
