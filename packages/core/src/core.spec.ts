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

  it("should grant access when user has required role", () => {
    const { ability, current } = matir.createSchema({
      order: {
        roles: ["admin"],
      },
    });

    current.role("admin");

    expect(ability.can("order")).toBe(true);
  });

  it("should deny access when subject does not exist in schema", () => {
    const { ability } = matir.createSchema({});

    // @ts-expect-error - testing non-existent subject
    expect(ability.can("production")).toBe(false);
  });

  it("should deny access when user does not have required role", () => {
    const { ability, current } = matir.createSchema({
      order: { roles: ["admin"] },
    });

    current.roles([]);

    expect(ability.can("order")).toBe(false);
  });

  it("should deny access when user does not have required action permission", () => {
    const { ability, current } = matir.createSchema({
      order: { roles: ["admin"], actions: ["read"] },
    });

    current.role("admin");

    // @ts-expect-error - testing action not defined in schema
    expect(ability.can("order", "delete")).toBe(false);
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

    expect(ability.can("order")).toBe(true);
    expect(ability.can("order", "read")).toBe(true);
    expect(ability.cannot("order", "read")).toBe(false);
    expect(ability.can("order", "delete")).toBe(false);
    expect(ability.cannot("order", "delete")).toBe(true);
  });

  it("should deny access when user passes condition but subject has no conditions in schema", () => {
    const { ability, current } = matir.createSchema({
      product: {
        actions: ["create", "read", "update", "delete"],
        roles: ["admin"],
        // Sem conditions no schema
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
});
