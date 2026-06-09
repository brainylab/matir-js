import { matir } from "@matir-js/core";
import { useContext, useMemo } from "react";

import { MatirContext } from "../matirContext";

export function useArrayList() {
  const ctx = useContext(MatirContext);
  if (!ctx)
    throw new Error("useArrayList must be used within <MatirProvider />");

  const arrayList = useMemo(
    () => matir.schemaToArray(ctx.schema),
    [ctx.schema],
  );

  return arrayList;
}
