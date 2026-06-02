import { describe, expect, it } from "vitest";

import { defineNav } from "./defineNav";

describe("defineNav", () => {
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
});
