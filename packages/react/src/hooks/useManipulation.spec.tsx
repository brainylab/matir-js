/** biome-ignore-all lint/style/noNonNullAssertion: <test> */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type React from "react";

vi.mock("./useArrayList", () => ({
  useArrayList: vi.fn(),
}));

vi.mock("../matir-context", async () => {
  const { createContext } = await import("react");
  return { MatirContext: createContext<any>(null) };
});

import { MatirContext } from "../matirContext";
import { useArrayList } from "./useArrayList";
import { useManipulation } from "./useManipulation";

const mockRules = [
  {
    id: "products",
    roles: ["admin"],
    actions: [
      { id: "create", label: "Create" },
      { id: "read", label: "Read" },
      { id: "update", label: "Update" },
    ],
  },
];

const mockRulesWithSub = [
  {
    id: "products",
    roles: ["admin"],
    sub: [
      {
        id: "reference",
        roles: ["admin"],
        actions: [
          { id: "create", label: "Create" },
          { id: "read", label: "Read" },
        ],
      },
    ],
  },
];

function createWrapper(permissions: Record<string, string[]>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MatirContext.Provider value={{ permissions } as any}>
        {children}
      </MatirContext.Provider>
    );
  };
}

describe("useManipulation", () => {
  it("should throw when used outside MatirProvider", () => {
    vi.mocked(useArrayList).mockReturnValue({
      rules: [],
      roles: [],
      actions: [],
    });

    expect(() => renderHook(() => useManipulation())).toThrow(
      "useManipulation must be used within <MatirProvider />",
    );
  });

  describe("buildState", () => {
    it("should set active: true for actions present in permissions", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({ products: ["create", "read"] }),
      });

      const actions = result.current.rules[0].actions!;
      expect(actions.find((a) => a.id === "create")?.active).toBe(true);
      expect(actions.find((a) => a.id === "read")?.active).toBe(true);
      expect(actions.find((a) => a.id === "update")?.active).toBe(false);
    });

    it("should set all active: false when permissions are empty", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      expect(result.current.rules[0].actions!.every((a) => !a.active)).toBe(
        true,
      );
    });

    it("should set path correctly for top-level rules", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      expect(result.current.rules[0].path).toBe("products");
    });

    it("should set path correctly for nested sub rules", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRulesWithSub,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      expect(result.current.rules[0].sub![0].path).toBe("products.reference");
    });

    it("should set active correctly for nested sub rules using full path as key", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRulesWithSub,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({ "products.reference": ["create"] }),
      });

      const subActions = result.current.rules[0].sub![0].actions!;
      expect(subActions.find((a) => a.id === "create")?.active).toBe(true);
      expect(subActions.find((a) => a.id === "read")?.active).toBe(false);
    });
  });

  describe("handleToggleAction", () => {
    it("should update the action active state", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      act(() => {
        result.current.handleToggleAction("products", "create", true);
      });

      expect(
        result.current.rules[0].actions!.find((a) => a.id === "create")?.active,
      ).toBe(true);
    });

    it("should return Record<path, activeActions[]>", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({ products: ["read"] }),
      });

      let returned: Record<string, string[]> = {};
      act(() => {
        returned = result.current.handleToggleAction(
          "products",
          "create",
          true,
        );
      });

      expect(returned).toEqual({ products: ["create", "read"] });
    });

    it("should return {} for a non-existent path", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      let returned: Record<string, string[]> = {};
      act(() => {
        returned = result.current.handleToggleAction(
          "invalid.path",
          "create",
          true,
        );
      });

      expect(returned).toEqual({});
    });

    it("should update action in nested sub rules", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRulesWithSub,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      let returned: Record<string, string[]> = {};
      act(() => {
        returned = result.current.handleToggleAction(
          "products.reference",
          "create",
          true,
        );
      });

      const subActions = result.current.rules[0].sub![0].actions!;
      expect(subActions.find((a) => a.id === "create")?.active).toBe(true);
      expect(returned).toEqual({ "products.reference": ["create"] });
    });
  });

  describe("handleSelectAll", () => {
    it("should set all actions to active", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      act(() => {
        result.current.handleSelectAll("products");
      });

      expect(result.current.rules[0].actions!.every((a) => a.active)).toBe(
        true,
      );
    });

    it("should return all action ids", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({}),
      });

      let returned: Record<string, string[]> = {};
      act(() => {
        returned = result.current.handleSelectAll("products");
      });

      expect(returned).toEqual({ products: ["create", "read", "update"] });
    });
  });

  describe("handleDeselectAll", () => {
    it("should set all actions to inactive", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({ products: ["create", "read", "update"] }),
      });

      act(() => {
        result.current.handleDeselectAll("products");
      });

      expect(result.current.rules[0].actions!.every((a) => !a.active)).toBe(
        true,
      );
    });

    it("should return empty actions array", () => {
      vi.mocked(useArrayList).mockReturnValue({
        rules: mockRules,
        roles: [],
        actions: [],
      });

      const { result } = renderHook(() => useManipulation(), {
        wrapper: createWrapper({ products: ["create", "read", "update"] }),
      });

      let returned: Record<string, string[]> = {};
      act(() => {
        returned = result.current.handleDeselectAll("products");
      });

      expect(returned).toEqual({ products: [] });
    });
  });
});
