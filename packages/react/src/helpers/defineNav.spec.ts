import { describe, expect, it } from "vitest";

import { defineNav } from "./defineNav";

describe("defineNav", () => {
  // ===== Testes de permissions (originais) =====

  it("should return the items array as is", () => {
    const nav = defineNav([
      {
        permissions: { dashboard: "view" },
      },
    ]);

    expect(nav).toEqual([
      {
        permissions: { dashboard: "view" },
      },
    ]);
  });

  it("should preserve permissions on each item", () => {
    const nav = defineNav([
      {
        permissions: {
          product: "read",
          "product.export": "view",
        },
      },
    ]);

    expect(nav[0].permissions).toEqual({
      product: "read",
      "product.export": "view",
    });
  });

  it("should preserve nested items", () => {
    const nav = defineNav([
      {
        permissions: { dashboard: "view" },
        items: [
          {
            permissions: { "dashboard.users": "edit" },
          },
        ],
      },
    ]);

    expect(nav[0].items?.[0].permissions).toEqual({
      "dashboard.users": "edit",
    });
  });

  it("should preserve multiple levels of nested items", () => {
    const nav = defineNav([
      {
        permissions: { root: "view" },
        items: [
          {
            permissions: { level1: "read" },
            items: [
              {
                permissions: { level2: "edit" },
              },
            ],
          },
        ],
      },
    ]);

    expect(nav[0].items?.[0].items?.[0].permissions).toEqual({
      level2: "edit",
    });
  });

  it("should accept multiple root items", () => {
    const nav = defineNav([
      { permissions: { dashboard: "view" } },
      { permissions: { product: "read" } },
      { permissions: { order: "view" } },
    ]);

    expect(nav).toHaveLength(3);
    expect(nav[1].permissions).toEqual({ product: "read" });
  });

  it("should accept extra fields via generic", () => {
    const nav = defineNav<{ href: string; label: string }>([
      {
        permissions: { dashboard: "view" },
        href: "/dashboard",
        label: "Dashboard",
        items: [
          {
            permissions: { "dashboard.users": "edit" },
            href: "/dashboard/users",
            label: "Users",
          },
        ],
      },
    ]);

    expect(nav[0].href).toBe("/dashboard");
    expect(nav[0].label).toBe("Dashboard");
    expect(nav[0].items?.[0].href).toBe("/dashboard/users");
  });

  it("should accept empty array", () => {
    const nav = defineNav([]);

    expect(nav).toEqual([]);
  });

  it("should accept leaf node without items", () => {
    const nav = defineNav([
      {
        permissions: { report: "read" },
      },
    ]);

    expect(nav[0].items).toBeUndefined();
  });

  it("should maintain reference integrity", () => {
    const input = [
      {
        permissions: { dashboard: "view" },
      },
    ];

    const nav = defineNav(input);

    expect(nav).toBe(input);
  });

  // ===== Testes de role =====

  it("should preserve role on each item", () => {
    const nav = defineNav([
      {
        role: ["admin"],
      },
    ]);

    expect(nav[0].role).toEqual(["admin"]);
  });

  it("should preserve multiple roles on items", () => {
    const nav = defineNav([
      {
        role: ["admin", "manager", "supervisor"],
      },
    ]);

    expect(nav[0].role).toEqual(["admin", "manager", "supervisor"]);
  });

  it("should preserve empty role array", () => {
    const nav = defineNav([
      {
        role: [],
      },
    ]);

    expect(nav[0].role).toEqual([]);
  });

  it("should preserve role in nested items", () => {
    const nav = defineNav([
      {
        role: ["admin"],
        items: [
          {
            role: ["manager"],
          },
        ],
      },
    ]);

    expect(nav[0].role).toEqual(["admin"]);
    expect(nav[0].items?.[0].role).toEqual(["manager"]);
  });

  it("should preserve role in multiple levels of nesting", () => {
    const nav = defineNav([
      {
        role: ["admin"],
        items: [
          {
            role: ["manager"],
            items: [
              {
                role: ["user"],
              },
            ],
          },
        ],
      },
    ]);

    expect(nav[0].role).toEqual(["admin"]);
    expect(nav[0].items?.[0].role).toEqual(["manager"]);
    expect(nav[0].items?.[0].items?.[0].role).toEqual(["user"]);
  });

  // ===== Testes combinados (permissions + role) =====

  it("should preserve both permissions and role on item", () => {
    const nav = defineNav([
      {
        permissions: { dashboard: "view" },
        role: ["admin"],
      },
    ]);

    expect(nav[0].permissions).toEqual({ dashboard: "view" });
    expect(nav[0].role).toEqual(["admin"]);
  });

  it("should preserve permissions and role in nested items", () => {
    const nav = defineNav([
      {
        permissions: { dashboard: "view" },
        role: ["admin"],
        items: [
          {
            permissions: { "dashboard.users": "edit" },
            role: ["manager"],
          },
        ],
      },
    ]);

    expect(nav[0].permissions).toEqual({ dashboard: "view" });
    expect(nav[0].role).toEqual(["admin"]);
    expect(nav[0].items?.[0].permissions).toEqual({
      "dashboard.users": "edit",
    });
    expect(nav[0].items?.[0].role).toEqual(["manager"]);
  });

  it("should accept role with extra fields via generic", () => {
    const nav = defineNav<{ href: string; label: string }>([
      {
        permissions: { dashboard: "view" },
        role: ["admin", "manager"],
        href: "/dashboard",
        label: "Dashboard",
        items: [
          {
            permissions: { "dashboard.users": "edit" },
            role: ["admin"],
            href: "/dashboard/users",
            label: "Users",
          },
        ],
      },
    ]);

    expect(nav[0].role).toEqual(["admin", "manager"]);
    expect(nav[0].href).toBe("/dashboard");
    expect(nav[0].items?.[0].role).toEqual(["admin"]);
    expect(nav[0].items?.[0].href).toBe("/dashboard/users");
  });

  it("should handle items with role but no permissions", () => {
    const nav = defineNav([
      {
        role: ["admin"],
      },
      {
        permissions: { dashboard: "view" },
      },
    ]);

    expect(nav[0].role).toEqual(["admin"]);
    expect(nav[0].permissions).toBeUndefined();
    expect(nav[1].permissions).toEqual({ dashboard: "view" });
    expect(nav[1].role).toBeUndefined();
  });

  it("should handle mixed items with different combinations of role and permissions", () => {
    const nav = defineNav([
      { permissions: { dashboard: "view" } },
      { role: ["admin"] },
      { permissions: { product: "read" }, role: ["manager"] },
      { role: ["user"], items: [{ role: ["guest"] }] },
    ]);

    expect(nav).toHaveLength(4);
    expect(nav[0].permissions).toEqual({ dashboard: "view" });
    expect(nav[0].role).toBeUndefined();
    expect(nav[1].role).toEqual(["admin"]);
    expect(nav[1].permissions).toBeUndefined();
    expect(nav[2].permissions).toEqual({ product: "read" });
    expect(nav[2].role).toEqual(["manager"]);
    expect(nav[3].role).toEqual(["user"]);
    expect(nav[3].items?.[0].role).toEqual(["guest"]);
  });
});
