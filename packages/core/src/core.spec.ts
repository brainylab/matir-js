import { describe, expect, it } from "vitest";

import { MatirCache } from "./cache";
import { matir } from "./index";

describe("MatirCore", () => {
  it("should be able to create a schema permission", () => {
    const schema = {
      order: {
        actions: ["create", "read", "update", "delete"],
        roles: ["admin"],
        sub: {
          export: {
            actions: ["create", "read", "update", "delete"],
            roles: ["admin"],
          },
        },
      },
    };

    const defineSchema = matir.defineSchema({
      order: {
        actions: ["create", "read", "update", "delete"],
        roles: ["admin"],
        sub: {
          export: {
            actions: ["create", "read", "update", "delete"],
            roles: ["admin"],
          },
        },
      },
    });

    expect(schema).toEqual(defineSchema);
  });

  it("should be able to define user permission", () => {
    const { current } = matir.createSchema({});

    const role = "admin";
    const permissions = { order: ["view"] };

    current.role(role);
    current.permissions(permissions);

    const currentValue = current.get();

    expect(currentValue.roles).toStrictEqual([role]);
    expect(currentValue.permissions).toEqual(permissions);

    current.roles(["view"]);

    expect(currentValue.roles).toStrictEqual([role, "view"]);

    current.clear();

    expect(current.get().roles).toEqual([]);
    expect(current.get().permissions).toEqual({});
  });

  it("should be able to action execute from define role", () => {
    const { ability, current } = matir.createSchema({
      order: {
        roles: ["admin"],
      },
    });

    current.role("admin");

    expect(ability.can("order")).toBe(true);
  });

  it("should not be able to action execute from define role", () => {
    const { ability, current } = matir.createSchema({
      order: {
        roles: ["admin"],
      },
    });

    current.role("editor");

    expect(ability.can("order")).toBe(false);
  });

  it("should be able to action execute from define permission", () => {
    const { ability, current } = matir.createSchema({
      order: {
        actions: ["create", "read", "update", "delete"],
        roles: ["admin"],
      },
    });

    current.role("admin");
    current.permissions({
      order: ["read"],
    });

    expect(ability.can("order", "read")).toBe(true);
    expect(ability.cannot("order", "read")).toBe(false);
    expect(ability.can("order", "delete")).toBe(false);
    expect(ability.cannot("order", "delete")).toBe(true);
  });
});
