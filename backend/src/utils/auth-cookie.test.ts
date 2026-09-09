import type { Response } from "express";
import jwt from "jsonwebtoken";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAuthCookie, generateTokenAndSetCookie } from "./generateTokenAndSetCookie.js";

function setRequiredEnvironment() {
  vi.stubEnv("MONGO_URI", "mongodb://127.0.0.1:27017/itsuki-test");
  vi.stubEnv("JWT_SECRET", "test-jwt-secret");
  vi.stubEnv("MAILTRAP_TOKEN", "test-mailtrap-token");
  vi.stubEnv("NODE_ENV", "development");
}

afterEach(() => vi.unstubAllEnvs());

describe("authentication cookie helpers", () => {
  it("creates an HTTP-only JWT cookie", () => {
    setRequiredEnvironment();
    const cookie = vi.fn();
    const response = { cookie } as unknown as Response;

    const token = generateTokenAndSetCookie(response, "user-id");

    expect(jwt.verify(token, "test-jwt-secret")).toMatchObject({ userId: "user-id" });
    expect(cookie).toHaveBeenCalledWith("token", token, expect.objectContaining({ httpOnly: true, secure: false, sameSite: "lax" }));
  });

  it("clears the cookie using the same path", () => {
    const clearCookie = vi.fn();
    clearAuthCookie({ clearCookie } as unknown as Response);
    expect(clearCookie).toHaveBeenCalledWith("token", expect.objectContaining({ path: "/" }));
  });
});
