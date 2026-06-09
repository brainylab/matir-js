import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type React from "react";

vi.mock("@matir-js/core", () => ({
  matir: {
    schemaToArray: vi.fn(),
  },
}));

vi.mock("../matir-context", async () => {
  const { createContext } = await import("react");
  return { MatirContext: createContext<any>(null) };
});

import { matir } from "@matir-js/core";

import { MatirContext } from "../matirContext";
import { useArrayList } from "./useArrayList";

const mockArrayResult = {
  roles: [{ id: "admin", label: "Admin" }],
  actions: [
    { id: "create", label: "Create" },
    { id: "read", label: "Read" },
  ],
  rules: [
    {
      id: "order",
      roles: ["admin"],
      actions: [
        { id: "create", label: "Create" },
        { id: "read", label: "Read" },
      ],
    },
  ],
};

describe("useArrayList", () => {
  it("should throw when used outside MatirProvider", () => {
    expect(() => renderHook(() => useArrayList())).toThrow(
      "useArrayList must be used within <MatirProvider />",
    );
  });

  it("should return the schemaToArray result", () => {
    vi.mocked(matir.schemaToArray).mockReturnValue(mockArrayResult);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MatirContext.Provider value={{ schema: {} } as any}>
        {children}
      </MatirContext.Provider>
    );

    const { result } = renderHook(() => useArrayList(), { wrapper });

    expect(result.current.roles).toEqual(mockArrayResult.roles);
    expect(result.current.actions).toEqual(mockArrayResult.actions);
    expect(result.current.rules).toEqual(mockArrayResult.rules);
  });

  it("should call schemaToArray with the schema from context", () => {
    vi.mocked(matir.schemaToArray).mockReturnValue(mockArrayResult);

    const mockSchema = { rules: {}, roles: {}, actions: {} };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MatirContext.Provider value={{ schema: mockSchema } as any}>
        {children}
      </MatirContext.Provider>
    );

    renderHook(() => useArrayList(), { wrapper });

    expect(vi.mocked(matir.schemaToArray)).toHaveBeenCalledWith(mockSchema);
  });
});
