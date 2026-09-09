import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSafeSeedEnvironment } from "./seed-guard.js";

afterEach(() => vi.unstubAllEnvs());

describe("assertSafeSeedEnvironment", () => {
  it("allows development seeds", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(assertSafeSeedEnvironment).not.toThrow();
  });

  it("blocks a production seed without an explicit override", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_DESTRUCTIVE_SEED", "false");
    expect(assertSafeSeedEnvironment).toThrow("Seed is blocked outside NODE_ENV=development");
  });

  it("allows an intentional override", () => {
    vi.stubEnv("NODE_ENV", "staging");
    vi.stubEnv("ALLOW_DESTRUCTIVE_SEED", "true");
    expect(assertSafeSeedEnvironment).not.toThrow();
  });
});
