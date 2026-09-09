import { afterEach, describe, expect, it, vi } from "vitest";
import { getEnv } from "./env.js";

function setRequiredEnvironment() {
  vi.stubEnv("MONGO_URI", "mongodb://127.0.0.1:27017/itsuki-test");
  vi.stubEnv("JWT_SECRET", "test-jwt-secret");
  vi.stubEnv("MAILTRAP_TOKEN", "test-mailtrap-token");
}

afterEach(() => vi.unstubAllEnvs());

describe("getEnv", () => {
  it("returns validated configuration", () => {
    setRequiredEnvironment();
    vi.stubEnv("PORT", "6000");
    vi.stubEnv("CLIENT_ORIGIN", "http://localhost:5173,https://app.example.test");

    expect(getEnv()).toMatchObject({
      PORT: 6000,
      CLIENT_ORIGINS: ["http://localhost:5173", "https://app.example.test"],
    });
  });

  it("rejects a missing secret", () => {
    setRequiredEnvironment();
    vi.stubEnv("JWT_SECRET", "");
    expect(() => getEnv()).toThrow("Missing required environment variable: JWT_SECRET");
  });
});
