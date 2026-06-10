import { matir, type SchemaArrayResult } from "@matir-js/core";
import { useContext, useMemo } from "react";

import type { MatirRegister } from "../matirContext";

import { MatirContext } from "../matirContext";

type Schema = ReturnType<typeof matir.defineSchema>;

type RegisteredSchema = MatirRegister extends { schema: infer S }
  ? S extends Schema
    ? S
    : Schema
  : Schema;

type RegisteredRoles = RegisteredSchema["roles"];
type RegisteredActions = RegisteredSchema["actions"];

export function useArrayList(): SchemaArrayResult<
  RegisteredRoles,
  RegisteredActions
> {
  const ctx = useContext(MatirContext);

  if (!ctx) {
    throw new Error("useArrayList must be used within <MatirProvider />");
  }

  const arrayList = useMemo(
    () => matir.schemaToArray(ctx.schema),
    [ctx.schema],
  );

  return arrayList as SchemaArrayResult<RegisteredRoles, RegisteredActions>;
}
