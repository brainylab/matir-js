import { useMemo } from "react";

import type { NavNode } from "../helpers/defineNav";

import { defineCanNav } from "../helpers/defineCanNav";
import { useCurrent } from "../matir-context";

export function useCanNav<TExtra extends object = object>(
  nav: NavNode<TExtra>[],
): NavNode<TExtra>[] {
  const { permissions } = useCurrent();

  return useMemo(
    () => defineCanNav(nav, permissions as Record<string, string[]> | null),
    [nav, permissions],
  );
}
