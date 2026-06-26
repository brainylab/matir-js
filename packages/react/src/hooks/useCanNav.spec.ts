import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../matirContext", () => ({
  useCurrent: vi.fn(),
}));

import { useCurrent } from "../matirContext";
import { useCanNav } from "./useCanNav";

describe("useCanNav", () => {
  // ===== Testes de permissions =====

  it("should return all items when all permissions pass", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"], product: ["read"] },
      role: null,
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
      permissions: null,
      role: null,
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
      role: null,
    } as any);

    const { result } = renderHook(() => useCanNav([{ permissions: {} }, {}]));

    expect(result.current).toHaveLength(2);
  });

  it("should filter nested items recursively", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"] },
      role: null,
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

    expect(result.current).toHaveLength(1);
    expect(result.current[0].items).toHaveLength(1);
    expect(result.current[0].items?.[0].permissions).toEqual({
      dashboard: "view",
    });
  });

  it("should check action correctly within subject permissions", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { "sales.budget": ["view", "create", "edit"] },
      role: null,
    } as any);

    const { result } = renderHook(() =>
      useCanNav([{ permissions: { "sales.budget": "view" } }]),
    );

    expect(result.current).toHaveLength(1);
  });

  it("should preserve extra fields on filtered items", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"] },
      role: null,
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
      role: null,
    } as any);

    const { result } = renderHook(() => useCanNav([]));

    expect(result.current).toEqual([]);
  });

  // ===== Testes de role =====

  it("should return items when user role matches nav role", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
      role: { value: "admin", description: null },
    } as any);

    const { result } = renderHook(() => useCanNav([{ role: ["admin"] }]));

    expect(result.current).toHaveLength(1);
  });

  it("should return items when user role matches one of multiple nav roles", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
      role: { value: "manager", description: null },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([{ role: ["admin", "manager"] }]),
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter items when user role does not match nav role", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
      role: { value: "user", description: null },
    } as any);

    const { result } = renderHook(() => useCanNav([{ role: ["admin"] }]));

    expect(result.current).toHaveLength(0);
  });

  it("should filter items when user has no role and nav requires role", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
      role: null,
    } as any);

    const { result } = renderHook(() => useCanNav([{ role: ["admin"] }]));

    expect(result.current).toHaveLength(0);
  });

  it("should return items without role restriction even if user has no role", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
      role: null,
    } as any);

    const { result } = renderHook(() => useCanNav([{ role: [] }, {}]));

    expect(result.current).toHaveLength(2);
  });

  // ===== Testes combinados (permissions + role) =====

  it("should require both permissions and role when both are defined (AND logic)", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"] },
      role: { value: "admin", description: null },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([
        {
          permissions: { dashboard: "view" },
          role: ["admin"],
        },
      ]),
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter when permissions pass but role fails (AND logic)", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { dashboard: ["view"] },
      role: { value: "user", description: null },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([
        {
          permissions: { dashboard: "view" },
          role: ["admin"],
        },
      ]),
    );

    expect(result.current).toHaveLength(0);
  });

  it("should filter when role passes but permissions fail (AND logic)", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
      role: { value: "admin", description: null },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([
        {
          permissions: { dashboard: "view" },
          role: ["admin"],
        },
      ]),
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle nested items with role validation recursively", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: null,
      role: { value: "admin", description: null },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([
        {
          role: ["admin"],
          items: [{ role: ["admin"] }, { role: ["manager"] }],
        },
      ]),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].items).toHaveLength(1);
    expect(result.current[0].items?.[0].role).toEqual(["admin"]);
  });

  it("should handle combined permissions and role in nested items", () => {
    vi.mocked(useCurrent).mockReturnValue({
      permissions: { "registers.clients": ["view"] },
      role: { value: "manager", description: null },
    } as any);

    const { result } = renderHook(() =>
      useCanNav([
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
      ]),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].items).toHaveLength(0);
  });
});
