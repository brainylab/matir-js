"use client";

import { type InferPermissions, type MatirCore, matir } from "@matir-js/core";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";

// biome-ignore lint/suspicious/noEmptyInterface: <- o usuário vai extender essa interface para registrar o schema>
export interface MatirRegister {
  // schema: typeof mySchema  ← o usuário declara aqui
}

type Schema = ReturnType<typeof matir.defineSchema>;

type RegisteredSchema = MatirRegister extends { schema: infer S }
  ? S extends Schema
    ? S
    : Schema
  : Schema;

export type MatirCurrentInput = {
  role?: string;
  permissions?: Record<string, string[]>;
};

export type RegisteredAbility = ReturnType<
  typeof MatirCore.createSchema<
    RegisteredSchema["roles"],
    RegisteredSchema["actions"],
    RegisteredSchema["rules"]
  >
>["ability"];

type CurrentRole = {
  value: string | null;
  description: string | null;
} | null;

type CurrentPermissions = MatirRegister extends { schema: infer S }
  ? S extends Schema
    ? InferPermissions<S>
    : Record<string, string[]>
  : Record<string, string[]>;

type MatirContextValue = {
  role: CurrentRole;
  permissions: CurrentPermissions | null;
  ability: RegisteredAbility;
  setCurrentRole: (role: string) => void;
  setCurrentPermissions: (permissions: Record<string, string[]>) => void;
  clearAll: () => void;
};

const MatirContext = createContext<MatirContextValue | null>(null);

export function MatirProvider({
  children,
  schema,
  current: initialCurrent,
}: {
  children: React.ReactNode;
  schema: Schema;
  current?: MatirCurrentInput;
}) {
  const [role, setRole] = useState<CurrentRole>(null);
  const [permissions, setPermissions] = useState<CurrentPermissions | null>(
    null,
  );

  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <inital current values>
  const { ability, current } = useMemo(() => {
    const instance = matir.createSchema(schema);

    if (initialCurrent?.role) {
      instance.current.role(initialCurrent.role);
    }

    if (initialCurrent?.permissions) {
      instance.current.permissions(initialCurrent.permissions);
    }

    return instance;
  }, []);

  const setCurrentRole = useCallback(
    (value: string) => {
      const activeRole = current.role(value);

      setRole(activeRole);
      forceUpdate();
    },
    [current],
  );

  const setCurrentPermissions = useCallback(
    (permissions: Record<string, string[]>) => {
      current.permissions(permissions);

      setPermissions(permissions);
      forceUpdate();
    },
    [current],
  );

  const clearAll = useCallback(() => {
    current.clear();
    forceUpdate();
  }, [current]);

  return (
    <MatirContext.Provider
      value={{
        role,
        permissions: permissions,
        ability: ability as RegisteredAbility,
        setCurrentRole,
        setCurrentPermissions,
        clearAll,
      }}
    >
      {children}
    </MatirContext.Provider>
  );
}

export function useCurrent() {
  const ctx = useContext(MatirContext);
  if (!ctx) throw new Error("useAbility must be used within <MatirProvider />");

  return {
    role: ctx.role,
    permissions: ctx.permissions as CurrentPermissions | null,
    setRole: ctx.setCurrentRole,
    setPermissions: ctx.setCurrentPermissions,
    clearAll: ctx.clearAll,
  };
}

export function useAbility(): RegisteredAbility {
  const ctx = useContext(MatirContext);
  if (!ctx) throw new Error("useAbility must be used within <MatirProvider />");
  return ctx.ability;
}
