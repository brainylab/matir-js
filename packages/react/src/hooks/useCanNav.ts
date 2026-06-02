import { useMemo } from "react";

import type { NavNode } from "../helpers/defineNav";

import { defineCanNav } from "../helpers/defineCanNav";
import { useAbility } from "../matir-context";

export function useCanNav<TExtra extends object = object>(
  nav: NavNode<TExtra>[],
): NavNode<TExtra>[] {
  const ability = useAbility();

  return useMemo(() => defineCanNav(nav, ability), [nav, ability]);
}
