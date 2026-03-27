import { describe, expect, it } from "vitest";

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
      roles: { admin: "admin" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
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
      },
    });

    expect(schema).toEqual(defineSchema.rules);
  });

  it("should be able to define user permission", () => {
    // @ts-expect-error
    const { current } = matir.createSchema({});

    const role = "admin";
    const permissions = { order: ["view"] };

    current.role(role);
    current.permissions(permissions);

    expect(current.get().role).toStrictEqual(role);
    expect(current.get().permissions).toEqual(permissions);

    current.role("view");

    expect(current.get().role).toStrictEqual("view");

    current.clear();

    expect(current.get().role).toEqual(null);
    expect(current.get().permissions).toEqual({});
  });

  it("should grant access when user has required role", () => {
    const { ability, current } = matir.createSchema({
      roles: { admin: "Administrador" },
      actions: {},
      rules: {
        order: {
          roles: ["admin"],
        },
      },
    });

    current.role("admin");

    expect(ability.can("order")).toBe(true);
  });

  it("should deny access when subject does not exist in schema", () => {
    // @ts-expect-error
    const { ability } = matir.createSchema({});

    expect(ability.can("production")).toBe(false);
  });

  it("should deny access when user does not have required role", () => {
    const { ability, current } = matir.createSchema({
      roles: { admin: "admin" },
      actions: {},
      rules: {
        order: { roles: ["admin"] },
      },
    });

    current.role("");

    expect(ability.can("order")).toBe(false);
  });

  it("should deny access when user does not have required action permission", () => {
    const { ability, current } = matir.createSchema({
      roles: { admin: "admin" },
      actions: { read: "read" },
      rules: {
        order: { roles: ["admin"], actions: ["read"] },
      },
    });

    current.role("admin");

    // @ts-expect-error - testing action not defined in schema
    expect(ability.can("order", "delete")).toBe(false);
  });

  it("should not be able to action execute from define role", () => {
    const { ability, current } = matir.createSchema({
      roles: { admin: "admin" },
      actions: {},
      rules: {
        order: {
          roles: ["admin"],
        },
      },
    });

    current.role("editor");

    expect(ability.can("order")).toBe(false);
  });

  it("should be able to action execute from define permission", () => {
    const { ability, current } = matir.createSchema({
      roles: { admin: "admin" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        order: {
          actions: ["create", "read", "update", "delete"],
          roles: ["admin"],
        },
      },
    });

    current.role("admin");
    current.permissions({
      order: ["read"],
    });

    expect(ability.can("order")).toBe(true);
    expect(ability.can("order", "read")).toBe(true);
    expect(ability.cannot("order", "read")).toBe(false);
    expect(ability.can("order", "delete")).toBe(false);
    expect(ability.cannot("order", "delete")).toBe(true);
  });

  it("should deny access when user passes condition but subject has no conditions in schema", () => {
    const { ability, current } = matir.createSchema({
      roles: { admin: "admin" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        product: {
          actions: ["create", "read", "update", "delete"],
          roles: ["admin"],
        },
      },
    });

    current.role("admin");
    current.permissions({
      product: ["read"],
    });

    // Usuário tenta passar uma condition mas o subject não tem conditions no schema
    expect(ability.can("product", "read", { ownerId: 123 })).toBe(false);
  });

  it("should be able to action execute from define permission and condition", () => {
    const { ability, current } = matir.createSchema({
      roles: { admin: "admin" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        order: {
          actions: ["create", "read", "update", "delete"],
          roles: ["admin"],
          conditions: {
            user: 1,
          },
        },
        config: {
          actions: ["create", "read", "update", "delete"],
          roles: ["admin"],
          conditions: {
            active: true,
          },
          sub: {
            list: {
              actions: ["create", "read", "update", "delete"],
              roles: ["admin"],
              conditions: {
                departament: "ti",
              },
            },
          },
        },
        users: {
          actions: ["create", "read", "update", "delete"],
          roles: ["admin"],
        },
      },
    });

    current.role("admin");
    current.permissions({
      order: ["read"],
      config: ["read"],
      "config.list": ["read"],
      users: ["read"],
    });

    // @ts-expect-error
    expect(ability.can("order", "read")).toBe(false);

    expect(ability.can("order", "read", { user: 1 })).toBe(true);
    expect(ability.can("order", "read", { user: 2 })).toBe(false);
    expect(ability.can("order", "delete", { user: 1 })).toBe(false);

    expect(ability.can("config", "read", { active: true })).toBe(true);
    expect(ability.can("config", "read", { active: false })).toBe(false);
    expect(ability.can("config", "delete", { active: true })).toBe(false);

    expect(ability.can("config.list", "read", { departament: "ti" })).toBe(
      true,
    );
    expect(
      ability.can("config.list", "read", { departament: "production" }),
    ).toBe(false);
    expect(ability.can("config.list", "delete", { departament: "ti" })).toBe(
      false,
    );

    expect(
      ability.can("users", "read", ({ user }) => user === 1, { user: 1 }),
    ).toBe(true);
    expect(
      ability.can("users", "read", ({ user }) => user === 1, { user: 2 }),
    ).toBe(false);
    expect(
      ability.can("users", "read", ({ departament }) => departament === "ti", {
        departament: "ti",
      }),
    ).toBe(true);
    expect(
      ability.can("users", "read", ({ departament }) => departament === "ti", {
        departament: "production",
      }),
    ).toBe(false);
    expect(
      ability.can("users", "read", ({ active }) => active === true, {
        active: true,
      }),
    ).toBe(true);
    expect(
      ability.can("users", "read", ({ active }) => active === true, {
        active: false,
      }),
    ).toBe(false);

    // cannot test
    expect(ability.cannot("order", "read", { user: 1 })).toBe(false);
    expect(ability.cannot("order", "read", { user: 2 })).toBe(true);
    expect(ability.cannot("order", "delete", { user: 1 })).toBe(true);

    expect(ability.cannot("config", "read", { active: true })).toBe(false);
    expect(ability.cannot("config", "read", { active: false })).toBe(true);
    expect(ability.cannot("config", "delete", { active: true })).toBe(true);

    expect(ability.cannot("config.list", "read", { departament: "ti" })).toBe(
      false,
    );
    expect(
      ability.cannot("config.list", "read", { departament: "production" }),
    ).toBe(true);
    expect(ability.cannot("config.list", "delete", { departament: "ti" })).toBe(
      true,
    );

    expect(
      ability.cannot("users", "read", ({ user }) => user === 1, { user: 1 }),
    ).toBe(false);
    expect(
      ability.cannot("users", "read", ({ user }) => user === 1, { user: 2 }),
    ).toBe(true);
    expect(
      ability.cannot(
        "users",
        "read",
        ({ departament }) => departament === "ti",
        {
          departament: "ti",
        },
      ),
    ).toBe(false);
    expect(
      ability.cannot(
        "users",
        "read",
        ({ departament }) => departament === "ti",
        {
          departament: "production",
        },
      ),
    ).toBe(true);
    expect(
      ability.cannot("users", "read", ({ active }) => active === true, {
        active: true,
      }),
    ).toBe(false);
    expect(
      ability.cannot("users", "read", ({ active }) => active === true, {
        active: false,
      }),
    ).toBe(true);
  });

  describe("getCurrentPermission", () => {
    const { current } = matir.createSchema({
      roles: { admin: "admin", manager: "manager" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        product: {
          roles: ["admin"],
          actions: ["read"],
          sub: {
            list: {
              roles: ["admin", "manager"],
              actions: ["read", "create"],
            },
            detail: {
              roles: ["admin"],
              actions: ["read", "update", "delete"],
            },
          },
        },
        order: {
          roles: ["admin"],
          actions: ["read"],
          sub: {
            export: {
              roles: ["admin"],
              actions: ["create"],
            },
          },
        },
      },
    });

    current.role("admin");
    current.permissions({
      product: ["read"],
      "product.list": ["read", "create"],
      "product.detail": ["read", "update"],
      "order.export": ["create"],
    });

    it("should return the actions for a specific subject", () => {
      expect(current.getPermission("product")).toEqual(["read"]);
      expect(current.getPermission("product.list")).toEqual(["read", "create"]);
      expect(current.getPermission("product.detail")).toEqual([
        "read",
        "update",
      ]);
      expect(current.getPermission("order.export")).toEqual(["create"]);
    });

    it("should return null when subject is not in current permissions", () => {
      expect(current.getPermission("order")).toBeNull();
    });
  });

  describe("getCurrentPermissions", () => {
    const { current } = matir.createSchema({
      roles: { admin: "admin", manager: "manager" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        product: {
          roles: ["admin"],
          actions: ["read"],
          sub: {
            list: {
              roles: ["admin", "manager"],
              actions: ["read", "create"],
            },
            detail: {
              roles: ["admin"],
              actions: ["read", "update", "delete"],
            },
          },
        },
        order: {
          roles: ["admin"],
          actions: ["read"],
          sub: {
            export: {
              roles: ["admin"],
              actions: ["create"],
            },
          },
        },
      },
    });

    current.role("admin");
    current.permissions({
      product: ["read"],
      "product.list": ["read", "create"],
      "product.detail": ["read", "update"],
      order: ["read"],
      "order.export": ["create"],
    });

    it("should return all permissions matching the wildcard prefix", () => {
      const result = current.getPermissions("product.*");

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          { key: "product", actions: ["read"] },
          { key: "product.list", actions: ["read", "create"] },
          { key: "product.detail", actions: ["read", "update"] },
        ]),
      );
    });

    it("should return only the matching prefix for order.*", () => {
      const result = current.getPermissions("order.*");

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          { key: "order", actions: ["read"] },
          { key: "order.export", actions: ["create"] },
        ]),
      );
    });

    it("should return empty array when no permissions match the wildcard", () => {
      const result = current.getPermissions("product.*");

      // remove todas as permissions do product para simular
      const { current: freshCurrent } = matir.createSchema({
        roles: { admin: "admin" },
        actions: { read: "read" },
        rules: {
          product: {
            roles: ["admin"],
            actions: ["read"],
            sub: {
              list: { roles: ["admin"], actions: ["read"] },
            },
          },
        },
      });

      freshCurrent.role("admin");
      freshCurrent.permissions({ order: ["read"] }); // só order, sem product

      expect(freshCurrent.getPermissions("product.*")).toEqual([]);
    });

    it("should not include permissions from other prefixes", () => {
      const result = current.getPermissions("product.*");

      const keys = result.map((r) => r.key);

      expect(keys).not.toContain("order");
      expect(keys).not.toContain("order.export");
    });
  });
});
