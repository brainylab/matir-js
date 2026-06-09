import { act, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type React from "react";

vi.mock("@matir-js/core", () => ({
  MatirCore: {
    createSchema: vi.fn(),
  },
  matir: {
    createSchema: vi.fn(),
    defineSchema: vi.fn(),
  },
}));

import { matir } from "@matir-js/core";

import { MatirProvider, useAbility, useCurrent } from "./matirContext";

const mockAbility = {
  can: vi.fn(),
  cannot: vi.fn(),
};

const mockCurrent = {
  role: vi.fn(),
  permissions: vi.fn(),
  getPermission: vi.fn(),
  getPermissions: vi.fn(),
  clear: vi.fn(),
  get: vi.fn(),
  getRole: vi.fn(),
};

const mockSchema = {} as any;

function createWrapper(current?: {
  role?: string;
  permissions?: Record<string, string[]>;
}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MatirProvider schema={mockSchema} current={current}>
        {children}
      </MatirProvider>
    );
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mockCurrent.role.mockReturnValue({ value: "admin", description: "Admin" });
  mockCurrent.getPermission.mockReturnValue(["read", "create"]);
  mockCurrent.getPermissions.mockReturnValue([
    { key: "order", actions: ["read"] },
  ]);

  vi.mocked(matir.createSchema).mockReturnValue({
    ability: mockAbility,
    current: mockCurrent,
  } as any);
});

describe("MatirProvider", () => {
  it("should render children", () => {
    render(
      <MatirProvider schema={mockSchema}>
        <span>content</span>
      </MatirProvider>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("should call matir.createSchema with the schema", () => {
    render(
      <MatirProvider schema={mockSchema}>
        <span />
      </MatirProvider>,
    );

    expect(vi.mocked(matir.createSchema)).toHaveBeenCalledWith(mockSchema);
  });

  it("should call current.role when initial role is provided", () => {
    render(
      <MatirProvider schema={mockSchema} current={{ role: "admin" }}>
        <span />
      </MatirProvider>,
    );

    expect(mockCurrent.role).toHaveBeenCalledWith("admin");
  });

  it("should call current.permissions when initial permissions are provided", () => {
    const permissions = { order: ["read"] };

    render(
      <MatirProvider schema={mockSchema} current={{ permissions }}>
        <span />
      </MatirProvider>,
    );

    expect(mockCurrent.permissions).toHaveBeenCalledWith(permissions);
  });

  it("should not call current.role when no initial role is provided", () => {
    render(
      <MatirProvider schema={mockSchema}>
        <span />
      </MatirProvider>,
    );

    expect(mockCurrent.role).not.toHaveBeenCalled();
  });
});

describe("useCurrent", () => {
  it("should throw when used outside MatirProvider", () => {
    expect(() => renderHook(() => useCurrent())).toThrow(
      "useAbility must be used within <MatirProvider />",
    );
  });

  it("should return initial role as null", () => {
    const { result } = renderHook(() => useCurrent(), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBeNull();
  });

  it("should return initial permissions as null", () => {
    const { result } = renderHook(() => useCurrent(), {
      wrapper: createWrapper(),
    });

    expect(result.current.permissions).toBeNull();
  });

  it("should update role when setRole is called", () => {
    const { result } = renderHook(() => useCurrent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setRole("admin");
    });

    expect(mockCurrent.role).toHaveBeenCalledWith("admin");
    expect(result.current.role).toEqual({
      value: "admin",
      description: "Admin",
    });
  });

  it("should update permissions when setPermissions is called", () => {
    const { result } = renderHook(() => useCurrent(), {
      wrapper: createWrapper(),
    });

    const permissions = { order: ["read", "create"] };

    act(() => {
      result.current.setPermissions(permissions);
    });

    expect(mockCurrent.permissions).toHaveBeenCalledWith(permissions);
    expect(result.current.permissions).toEqual(permissions);
  });

  it("should call current.clear when clearAll is called", () => {
    const { result } = renderHook(() => useCurrent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.clearAll();
    });

    expect(mockCurrent.clear).toHaveBeenCalled();
  });

  it("should call current.getPermission with subject", () => {
    const { result } = renderHook(() => useCurrent(), {
      wrapper: createWrapper(),
    });

    result.current.getPermission("order" as any);

    expect(mockCurrent.getPermission).toHaveBeenCalledWith("order");
  });

  it("should call current.getPermissions with pattern", () => {
    const { result } = renderHook(() => useCurrent(), {
      wrapper: createWrapper(),
    });

    result.current.getPermissions("order.*" as any);

    expect(mockCurrent.getPermissions).toHaveBeenCalledWith("order.*");
  });
});

describe("useAbility", () => {
  it("should throw when used outside MatirProvider", () => {
    expect(() => renderHook(() => useAbility())).toThrow(
      "useAbility must be used within <MatirProvider />",
    );
  });

  it("should return the ability object from createSchema", () => {
    const { result } = renderHook(() => useAbility(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(mockAbility);
  });

  it("should expose a working can method", () => {
    mockAbility.can.mockReturnValue(true);

    const { result } = renderHook(() => useAbility(), {
      wrapper: createWrapper(),
    });

    result.current.can("order" as any, "read" as any);

    expect(mockAbility.can).toHaveBeenCalledWith("order", "read");
  });
});
