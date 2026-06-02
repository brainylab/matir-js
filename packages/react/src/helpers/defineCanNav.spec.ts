import { describe, expect, it } from "vitest";

import { defineCanNav } from "./defineCanNav";

describe("defineCanNav", () => {
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
      {},
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
});
