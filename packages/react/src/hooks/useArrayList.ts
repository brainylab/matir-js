import {
  type ActionsDefinition,
  matir,
  type RolesDefinition,
  type SchemaArrayResult,
} from "@matir-js/core";
import { useContext, useMemo } from "react";

import { MatirContext } from "../matirContext";

export function useArrayList(): SchemaArrayResult<
  RolesDefinition,
  ActionsDefinition
> {
  const ctx = useContext(MatirContext);
  if (!ctx)
    throw new Error("useArrayList must be used within <MatirProvider />");

  const arrayList = useMemo(
    () => matir.schemaToArray(ctx.schema),
    [ctx.schema],
  );

  return arrayList;
}
