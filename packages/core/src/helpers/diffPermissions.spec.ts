import { describe, expect, it } from "vitest";

import type { MatirCurrentPermissions } from "../types";

import { diffPermissions } from "./diffPermissions";

describe("diffPermissions", () => {
  it("should add new keys from values to current", () => {
    const current: MatirCurrentPermissions = {
      order: ["read"],
    };

    const values: MatirCurrentPermissions = {
      order: ["read"],
      product: ["create", "view"],
    };

    diffPermissions(current, values);

    expect(current).toEqual({
      order: ["read"],
      product: ["create", "view"],
    });
  });

  it("should add actions that exist in values but not in current", () => {
    const current: MatirCurrentPermissions = {
      order: ["read"],
    };

    const values: MatirCurrentPermissions = {
      order: ["read", "update", "delete"],
    };

    diffPermissions(current, values);

    expect(current.order).toContain("read");
    expect(current.order).toContain("update");
    expect(current.order).toContain("delete");
    expect(current.order).toHaveLength(3);
  });

  it("should remove actions that exist in current but not in values", () => {
    const current: MatirCurrentPermissions = {
      order: ["read", "create", "delete"],
    };

    const values: MatirCurrentPermissions = {
      order: ["read"],
    };

    diffPermissions(current, values);

    expect(current.order).toEqual(["read"]);
  });

  it("should sync arrays by adding and removing actions", () => {
    const current: MatirCurrentPermissions = {
      order: ["read", "create", "delete"],
      product: ["view"],
    };

    const values: MatirCurrentPermissions = {
      order: ["read", "update"],
      product: ["view", "edit"],
    };

    diffPermissions(current, values);

    expect(current.order).toEqual(["read", "update"]);
    expect(current.product).toEqual(["view", "edit"]);
  });

  it("should preserve keys that exist only in current", () => {
    const current: MatirCurrentPermissions = {
      order: ["read"],
      product: ["view"],
      user: ["admin"],
    };

    const values: MatirCurrentPermissions = {
      order: ["read", "update"],
    };

    diffPermissions(current, values);

    expect(current).toEqual({
      order: ["read", "update"],
      product: ["view"],
      user: ["admin"],
    });
  });

  it("should handle nested subject keys correctly", () => {
    const current: MatirCurrentPermissions = {
      "order.status": ["read"],
    };

    const values: MatirCurrentPermissions = {
      "order.status": ["read", "update"],
      "order.items": ["list"],
    };

    diffPermissions(current, values);

    expect(current["order.status"]).toEqual(["read", "update"]);
    expect(current["order.items"]).toEqual(["list"]);
  });

  it("should remove key when values has empty array", () => {
    const current: MatirCurrentPermissions = {
      order: ["read", "create", "delete"],
      product: ["view"],
    };

    const values: MatirCurrentPermissions = {
      order: [],
    };

    diffPermissions(current, values);

    expect(current).toEqual({
      product: ["view"],
    });
    expect(current.order).toBeUndefined();
  });

  it("should not add key when values has empty array", () => {
    const current: MatirCurrentPermissions = {
      product: ["view"],
    };

    const values: MatirCurrentPermissions = {
      order: [],
    };

    diffPermissions(current, values);

    expect(current).toEqual({
      product: ["view"],
    });
    expect(current.order).toBeUndefined();
  });

  it("should remove key when all actions are removed", () => {
    const current: MatirCurrentPermissions = {
      order: ["read"],
      product: ["view"],
    };

    const values: MatirCurrentPermissions = {
      order: [],
    };

    diffPermissions(current, values);

    expect(current).toEqual({
      product: ["view"],
    });
    expect(current.order).toBeUndefined();
  });

  it("should return the modified current object", () => {
    const current: MatirCurrentPermissions = {
      order: ["read"],
    };

    const values: MatirCurrentPermissions = {
      order: ["read", "update"],
    };

    const result = diffPermissions(current, values);

    expect(result).toBe(current);
    expect(result.order).toEqual(["read", "update"]);
  });

  it("should handle complex scenario with multiple operations", () => {
    const current: MatirCurrentPermissions = {
      order: ["read", "create", "delete"],
      product: ["view"],
      user: ["read"],
      category: ["list", "detail"],
    };

    const values: MatirCurrentPermissions = {
      order: ["read", "update"],
      product: ["view", "edit", "delete"],
      category: [],
      settings: ["configure"],
    };

    diffPermissions(current, values);

    expect(current).toEqual({
      order: ["read", "update"],
      product: ["view", "edit", "delete"],
      user: ["read"], // preserved
      settings: ["configure"], // added
      // category foi removida por ter array vazio
    });
    expect(current.category).toBeUndefined();
  });
});
