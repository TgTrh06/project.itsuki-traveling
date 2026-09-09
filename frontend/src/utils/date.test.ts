import { describe, expect, it } from "vitest";
import { formatDate } from "./date";

describe("formatDate", () => {
  it("returns a clear result for invalid dates", () => {
    expect(formatDate("not-a-date")).toBe("Invalid Date");
  });
});
