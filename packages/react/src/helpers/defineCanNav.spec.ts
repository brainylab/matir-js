import { describe, expect, it, vi } from "vitest";

import type { RegisteredAbility } from "../matir-context";

import { defineCanNav } from "./defineCanNav";

function mockAbility(
  canReturn: boolean | ((subject: string, action: string) => boolean),
): RegisteredAbility {
  return {
    can: vi.fn((subject: string, action: string) =>
      typeof canReturn === "function" ? canReturn(subject, action) : canReturn,
    ),
    cannot: vi.fn(),
  } as unknown as RegisteredAbility;
}

describe("defineCanNav", () => {
  it("should return all items when all permissions pass", () => {
    const ability = mockAbility(true);

    const result = defineCanNav(
      [
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ],
      ability,
    );

    expect(result).toHaveLength(2);
  });

  it("should filter out items when permission is denied", () => {
    const ability = mockAbility(false);

    const result = defineCanNav(
      [
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ],
      ability,
    );

    expect(result).toHaveLength(0);
  });

  it("should always include items without permissions", () => {
    const ability = mockAbility(false);

    const result = defineCanNav([{ permissions: {} }, {}], ability);

    expect(result).toHaveLength(2);
  });

  it("should pass if at least one permission entry passes (OR logic)", () => {
    const ability = mockAbility((subject) => subject === "order");

    const result = defineCanNav(
      [
        {
          permissions: {
            product: "read",
            order: "view",
          },
        },
      ],
      ability,
    );

    expect(result).toHaveLength(1);
  });

  it("should filter nested items recursively", () => {
    const ability = mockAbility((subject) => subject === "dashboard");

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
      ability,
    );

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items?.[0].permissions).toEqual({ dashboard: "view" });
  });

  it("should keep parent even when all children are filtered", () => {
    const ability = mockAbility((subject) => subject === "dashboard");

    const result = defineCanNav(
      [
        {
          permissions: { dashboard: "view" },
          items: [{ permissions: { product: "read" } }],
        },
      ],
      ability,
    );

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(0);
  });

  it("should return empty array when input is empty", () => {
    const ability = mockAbility(true);

    const result = defineCanNav([], ability);

    expect(result).toEqual([]);
  });

  it("should preserve extra fields on filtered items", () => {
    const ability = mockAbility(true);

    const result = defineCanNav<{ href: string; label: string }>(
      [
        {
          permissions: { dashboard: "view" },
          href: "/dashboard",
          label: "Dashboard",
        },
      ],
      ability,
    );

    expect(result[0].href).toBe("/dashboard");
    expect(result[0].label).toBe("Dashboard");
  });
});
