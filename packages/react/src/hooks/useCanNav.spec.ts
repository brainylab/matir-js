import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { RegisteredAbility } from "../matir-context";

// mock do contexto
vi.mock("../matir-context", () => ({
  useAbility: vi.fn(),
}));

import { useAbility } from "../matir-context";
import { useCanNav } from "./useCanNav";

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

describe("useCanNav", () => {
  it("should return all items when all permissions pass", () => {
    vi.mocked(useAbility).mockReturnValue(mockAbility(true));

    const { result } = renderHook(() =>
      useCanNav([
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ]),
    );

    expect(result.current).toHaveLength(2);
  });

  it("should filter out items when permission is denied", () => {
    vi.mocked(useAbility).mockReturnValue(mockAbility(false));

    const { result } = renderHook(() =>
      useCanNav([
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ]),
    );

    expect(result.current).toHaveLength(0);
  });

  it("should always include items without permissions", () => {
    vi.mocked(useAbility).mockReturnValue(mockAbility(false));

    const { result } = renderHook(() => useCanNav([{ permissions: {} }, {}]));

    expect(result.current).toHaveLength(2);
  });

  it("should pass if at least one permission entry passes (OR logic)", () => {
    vi.mocked(useAbility).mockReturnValue(
      mockAbility((subject) => subject === "order"),
    );

    const { result } = renderHook(() =>
      useCanNav([{ permissions: { product: "read", order: "view" } }]),
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter nested items recursively", () => {
    vi.mocked(useAbility).mockReturnValue(
      mockAbility((subject) => subject === "dashboard"),
    );

    const { result } = renderHook(() =>
      useCanNav([
        {
          permissions: { dashboard: "view" },
          items: [
            { permissions: { dashboard: "view" } },
            { permissions: { product: "read" } },
          ],
        },
      ]),
    );

    expect(result.current[0].items).toHaveLength(1);
    expect(result.current[0].items?.[0].permissions).toEqual({
      dashboard: "view",
    });
  });

  it("should keep parent even when all children are filtered", () => {
    vi.mocked(useAbility).mockReturnValue(
      mockAbility((subject) => subject === "dashboard"),
    );

    const { result } = renderHook(() =>
      useCanNav([
        {
          permissions: { dashboard: "view" },
          items: [{ permissions: { product: "read" } }],
        },
      ]),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].items).toHaveLength(0);
  });

  it("should preserve extra fields on filtered items", () => {
    vi.mocked(useAbility).mockReturnValue(mockAbility(true));

    const { result } = renderHook(() =>
      useCanNav<{ href: string; label: string }>([
        {
          permissions: { dashboard: "view" },
          href: "/dashboard",
          label: "Dashboard",
        },
      ]),
    );

    expect(result.current[0].href).toBe("/dashboard");
    expect(result.current[0].label).toBe("Dashboard");
  });

  it("should return empty array when input is empty", () => {
    vi.mocked(useAbility).mockReturnValue(mockAbility(true));

    const { result } = renderHook(() => useCanNav([]));

    expect(result.current).toEqual([]);
  });
});
