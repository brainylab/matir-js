import { describe, expect, it } from "vitest";

import { defineCanNav } from "./defineCanNav";

describe("defineCanNav", () => {
  // ===== Testes de permissions =====

  it("should return all items when all permissions pass", () => {
    const result = defineCanNav(
      [
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ],
      {
        dashboard: ["view"],
        product: ["read"],
      },
    );

    expect(result).toHaveLength(2);
  });

  it("should filter out items when permission is denied", () => {
    const result = defineCanNav(
      [
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ],
      null,
    );

    expect(result).toHaveLength(0);
  });

  it("should always include items without permissions", () => {
    const result = defineCanNav([{ permissions: {} }, {}], null);

    expect(result).toHaveLength(2);
  });

  it("should return all items when permissions is null and no nav permissions defined", () => {
    const result = defineCanNav([{}, {}], null);

    expect(result).toHaveLength(2);
  });

  it("should filter all items when permissions is null and nav has permissions", () => {
    const result = defineCanNav([{ permissions: { dashboard: "view" } }], null);

    expect(result).toHaveLength(0);
  });

  it("should pass if at least one permission entry passes (OR logic)", () => {
    const result = defineCanNav(
      [
        {
          permissions: {
            product: "read",
            order: "view",
          },
        },
      ],
      {
        order: ["view"],
      },
    );

    expect(result).toHaveLength(1);
  });

  it("should filter nested items recursively", () => {
    const result = defineCanNav(
      [
        {
          permissions: { dashboard: "view" },
          items: [
            { permissions: { dashboard: "view" } },
            { permissions: { product: "read" } },
          ],
        },
      ],
      {
        dashboard: ["view"],
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items?.[0].permissions).toEqual({ dashboard: "view" });
  });

  it("should keep parent even when all children are filtered", () => {
    const result = defineCanNav(
      [
        {
          permissions: { dashboard: "view" },
          items: [{ permissions: { product: "read" } }],
        },
      ],
      {
        dashboard: ["view"],
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(0);
  });

  it("should return empty array when input is empty", () => {
    const result = defineCanNav([], { dashboard: ["view"] });

    expect(result).toEqual([]);
  });

  it("should preserve extra fields on filtered items", () => {
    const result = defineCanNav<{ href: string; label: string }>(
      [
        {
          permissions: { dashboard: "view" },
          href: "/dashboard",
          label: "Dashboard",
        },
      ],
      {
        dashboard: ["view"],
      },
    );

    expect(result[0].href).toBe("/dashboard");
    expect(result[0].label).toBe("Dashboard");
  });

  it("should check action correctly within subject permissions", () => {
    const result = defineCanNav([{ permissions: { "sales.budget": "view" } }], {
      "sales.budget": ["view", "create", "edit"],
    });

    expect(result).toHaveLength(1);
  });

  it("should filter when action is not in subject permissions", () => {
    const result = defineCanNav(
      [{ permissions: { "sales.budget": "delete" } }],
      {
        "sales.budget": ["view", "create", "edit"],
      },
    );

    expect(result).toHaveLength(0);
  });

  // ===== Testes de role =====

  it("should return items when user role matches nav role", () => {
    const result = defineCanNav([{ role: ["admin"] }], null, "admin");

    expect(result).toHaveLength(1);
  });

  it("should return items when user role matches one of multiple nav roles", () => {
    const result = defineCanNav(
      [{ role: ["admin", "manager"] }],
      null,
      "manager",
    );

    expect(result).toHaveLength(1);
  });

  it("should filter items when user role does not match nav role", () => {
    const result = defineCanNav([{ role: ["admin"] }], null, "user");

    expect(result).toHaveLength(0);
  });

  it("should filter items when user has no role and nav requires role", () => {
    const result = defineCanNav([{ role: ["admin"] }], null, null);

    expect(result).toHaveLength(0);
  });

  it("should return items without role restriction even if user has no role", () => {
    const result = defineCanNav([{ role: [] }, {}], null, null);

    expect(result).toHaveLength(2);
  });

  // ===== Testes combinados (permissions + role) =====

  it("should require both permissions and role when both are defined (AND logic)", () => {
    const result = defineCanNav(
      [
        {
          permissions: { dashboard: "view" },
          role: ["admin"],
        },
      ],
      {
        dashboard: ["view"],
      },
      "admin",
    );

    expect(result).toHaveLength(1);
  });

  it("should filter when permissions pass but role fails (AND logic)", () => {
    const result = defineCanNav(
      [
        {
          permissions: { dashboard: "view" },
          role: ["admin"],
        },
      ],
      {
        dashboard: ["view"],
      },
      "user",
    );

    expect(result).toHaveLength(0);
  });

  it("should filter when role passes but permissions fail (AND logic)", () => {
    const result = defineCanNav(
      [
        {
          permissions: { dashboard: "view" },
          role: ["admin"],
        },
      ],
      null,
      "admin",
    );

    expect(result).toHaveLength(0);
  });

  it("should handle nested items with role validation recursively", () => {
    const result = defineCanNav(
      [
        {
          role: ["admin"],
          items: [{ role: ["admin"] }, { role: ["manager"] }],
        },
      ],
      null,
      "admin",
    );

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items?.[0].role).toEqual(["admin"]);
  });

  it("should handle combined permissions and role in nested items", () => {
    const result = defineCanNav(
      [
        {
          permissions: { "registers.clients": "view" },
          role: ["admin", "manager"],
          items: [
            {
              permissions: { "registers.products": "view" },
              role: ["admin"],
            },
          ],
        },
      ],
      {
        "registers.clients": ["view"],
      },
      "manager",
    );

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(0);
  });

  it("should allow access when only permission is required and user has it", () => {
    const result = defineCanNav(
      [
        {
          permissions: { dashboard: "view" },
        },
      ],
      {
        dashboard: ["view"],
      },
      "user",
    );

    expect(result).toHaveLength(1);
  });

  it("should allow access when only role is required and user has it", () => {
    const result = defineCanNav(
      [
        {
          role: ["user"],
        },
      ],
      {
        dashboard: ["view"],
      },
      "user",
    );

    expect(result).toHaveLength(1);
  });

  it("should handle multiple items with mixed role and permission requirements", () => {
    const result = defineCanNav(
      [
        { role: ["admin"] },
        { permissions: { dashboard: "view" } },
        { role: ["manager"], permissions: { product: "read" } },
        {},
      ],
      {
        dashboard: ["view"],
        product: ["read"],
      },
      "manager",
    );

    expect(result).toHaveLength(3); // admin role fails, others pass
  });
});
