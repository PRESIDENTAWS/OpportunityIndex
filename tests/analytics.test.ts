import { describe, expect, it } from "vitest";
import { isValidGaMeasurementId } from "@/lib/analytics/constants";

/**
 * GA4 measurement ID validation.
 *
 * The property under test: the ID is interpolated into an inline <script>, so
 * anything that could break out of that string literal must be refused rather
 * than escaped.
 */

describe("isValidGaMeasurementId", () => {
  it("accepts well-formed GA4 measurement IDs", () => {
    expect(isValidGaMeasurementId("G-ABC1234567")).toBe(true);
    expect(isValidGaMeasurementId("G-XXXX")).toBe(true);
    expect(isValidGaMeasurementId("G-1234567890ABCDEFGHIJ")).toBe(true);
  });

  it("rejects absent or empty values", () => {
    expect(isValidGaMeasurementId(undefined)).toBe(false);
    expect(isValidGaMeasurementId(null)).toBe(false);
    expect(isValidGaMeasurementId("")).toBe(false);
  });

  it("rejects the wrong prefix", () => {
    // Universal Analytics and Measurement IDs from other products.
    expect(isValidGaMeasurementId("UA-12345-1")).toBe(false);
    expect(isValidGaMeasurementId("GTM-ABC123")).toBe(false);
    expect(isValidGaMeasurementId("ABC1234567")).toBe(false);
  });

  it("rejects lowercase, which GA4 never issues", () => {
    expect(isValidGaMeasurementId("G-abc1234567")).toBe(false);
  });

  it("rejects anything that could break out of an inline script literal", () => {
    const injections = [
      "G-ABC'; alert(1); //",
      "G-ABC\"; alert(1); //",
      "G-ABC</script><script>alert(1)</script>",
      "G-ABC\n});alert(1);(function(){",
      "G-ABC`+alert(1)+`",
      "G-ABC${alert(1)}",
      "G-ABC\\",
    ];
    for (const value of injections) {
      expect(isValidGaMeasurementId(value)).toBe(false);
    }
  });

  it("rejects a value that is too long", () => {
    expect(isValidGaMeasurementId(`G-${"A".repeat(50)}`)).toBe(false);
  });

  it("rejects whitespace padding", () => {
    expect(isValidGaMeasurementId(" G-ABC1234567 ")).toBe(false);
  });
});
