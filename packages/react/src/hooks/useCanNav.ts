import { useMemo } from "react";

import type { NavNode } from "../helpers/defineNav";

import { defineCanNav } from "../helpers/defineCanNav";
import { useCurrent } from "../matirContext";

export function useCanNav<TExtra extends object = object>(
  nav: NavNode<TExtra>[],
): NavNode<TExtra>[] {
  const { permissions, role } = useCurrent();

  return useMemo(
    () =>
      defineCanNav(
        nav,
        permissions as Record<string, string[]> | null,
        role?.value as string | null,
      ),
    [nav, permissions, role],
  );
}
