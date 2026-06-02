import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../matir-context", () => ({
  useCurrent: vi.fn(),
}));

import { useCurrent } from "../matir-context";
import { useCanNav } from "./useCanNav";

describe("useCanNav", () => {
  it("should return all items when all permissions pass", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"], product: ["read"] },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ]),
    );

    expect(result.current).toHaveLength(2);
  });

  it("should filter out items when user has no permissions", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: {},
    } as any);

    const { result } = renderHook(() =>
      useCanNav([
        { permissions: { dashboard: "view" } },
        { permissions: { product: "read" } },
      ]),
    );

    expect(result.current).toHaveLength(0);
  });

  it("should always include items without permissions", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
    } as any);

    const { result } = renderHook(() => useCanNav([{ permissions: {} }, {}]));

    expect(result.current).toHaveLength(2);
  });

  it("should filter nested items recursively", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"] },
    } as any);

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

  it("should check action correctly within subject permissions", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { "sales.budget": ["view", "create", "edit"] },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([{ permissions: { "sales.budget": "view" } }]),
    );

    expect(result.current).toHaveLength(1);
  });

  it("should preserve extra fields on filtered items", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"] },
    } as any);

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
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"] },
    } as any);

    const { result } = renderHook(() => useCanNav([]));

    expect(result.current).toEqual([]);
  });
});
