import type { NavNode, NavPermissions } from "./defineNav";

function hasPermission(
  navPermissions: NavPermissions | undefined,
  currentPermissions: Record<string, string[]> | null,
): boolean {
  if (!navPermissions || Object.keys(navPermissions).length === 0) return true;
  if (!currentPermissions) return false;

  return Object.entries(navPermissions).some(
    ([subject, action]) =>
      currentPermissions[subject]?.includes(action as string) ?? false,
  );
}

export function defineCanNav<TExtra extends object = object>(
  nav: NavNode<TExtra>[],
  permissions: Record<string, string[]> | null,
): NavNode<TExtra>[] {
  return nav.reduce<NavNode<TExtra>[]>((acc, item) => {
    if (!hasPermission(item.permissions, permissions)) return acc;

    acc.push(
      item.items?.length
        ? { ...item, items: defineCanNav(item.items, permissions) }
        : item,
    );

    return acc;
  }, []);
}
