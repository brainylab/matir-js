import type { RegisteredAbility } from "../matir-context";
import type { NavNode, NavPermissions } from "./defineNav";

function hasPermission(
  permissions: NavPermissions | undefined,
  ability: RegisteredAbility,
): boolean {
  if (!permissions || Object.keys(permissions).length === 0) return true;

  return Object.entries(permissions).some(([subject, action]) =>
    ability.can(subject as any, action as any),
  );
}

export function defineCanNav<TExtra extends object = object>(
  items: NavNode<TExtra>[],
  ability: RegisteredAbility,
): NavNode<TExtra>[] {
  return items.reduce<NavNode<TExtra>[]>((acc, item) => {
    if (!hasPermission(item.permissions, ability)) return acc;

    acc.push(
      item.items?.length
        ? { ...item, items: defineCanNav(item.items, ability) }
        : item,
    );

    return acc;
  }, []);
}
