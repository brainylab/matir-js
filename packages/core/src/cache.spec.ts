import { afterAll, describe, expect, it } from "vitest";

import { MatirCache } from "./cache";

describe("MatirCache", () => {
  const cached = MatirCache.create({
    order: { actions: ["read", "delete"], roles: ["admin"] },
    config: {
      roles: ["super_admin", "admin"],
      sub: {
        user: {
          actions: ["read", "update", "delete"],
          roles: ["admin"],
          sub: { security: { roles: ["admin"] } },
        },
      },
    },
  });

  afterAll(() => {
    cached.clear();
  });

  it("should be able to get a cache from permission object key", () => {
    const orderPermission = cached.get("order");

    expect(orderPermission).toEqual({
      actions: ["read", "delete"],
      roles: ["admin"],
    });

    const configPermission = cached.get("config.user");

    expect(configPermission).toEqual({
      actions: ["read", "update", "delete"],
      roles: ["admin"],
    });
  });

  it("should be able to get a cache from permission object key with nested sub", () => {
    const userPermission = cached.get("config.user");

    expect(userPermission).toEqual({
      actions: ["read", "update", "delete"],
      roles: ["admin"],
    });

    const userSecurityPermission = cached.get("config.user.security");

    expect(userSecurityPermission).toEqual({
      roles: ["admin"],
    });
  });
});
