// @ts-nocheck
import { describe, it, expect } from "vitest";
import { buildCitySearchParams } from "./cities.queries";

describe("buildCitySearchParams", () => {
  it("builds like query when search provided", () => {
    const p = buildCitySearchParams({
      search: "clu",
      limit: 10,
      verifiedOnly: true,
      popularFallback: false,
    });
    expect(p.get("where[name][like]")).toBe("clu");
    expect(p.get("where[verified][equals]")).toBe("true");
    expect(p.get("limit")).toBe("10");
    expect(p.get("sort")).toBe("name");
  });

  it("builds popular fallback when search empty", () => {
    const p = buildCitySearchParams({
      search: "",
      limit: 5,
      verifiedOnly: true,
      popularFallback: true,
    });
    expect(p.get("sort")).toBe("-usageCount");
    expect(p.get("limit")).toBe("5");
    expect(p.get("where[verified][equals]")).toBe("true");
    expect(p.get("where[name][like]")).toBeNull();
  });
});
