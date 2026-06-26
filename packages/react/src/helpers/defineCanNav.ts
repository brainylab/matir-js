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

function hasRole(
  navRoles: string[] | undefined,
  userRole: string | null,
): boolean {
  // Se não há restrição de role, permite acesso
  if (!navRoles || navRoles.length === 0) return true;
  if (!userRole) return false;

  // Verifica se o userRole está incluído nas roles permitidas
  return navRoles.includes(userRole);
}

function hasAccess(
  navPermissions: NavPermissions | undefined,
  navRoles: string[] | undefined,
  currentPermissions: Record<string, string[]> | null,
  userRole: string | null,
): boolean {
  const hasNavPermissions =
    navPermissions && Object.keys(navPermissions).length > 0;
  const hasNavRoles = navRoles && navRoles.length > 0;

  // Se tem ambos os tipos de restrição, ambos devem passar
  if (hasNavPermissions && hasNavRoles) {
    return (
      hasPermission(navPermissions, currentPermissions) &&
      hasRole(navRoles, userRole)
    );
  }

  // Se tem apenas permissions
  if (hasNavPermissions) {
    return hasPermission(navPermissions, currentPermissions);
  }

  // Se tem apenas roles
  if (hasNavRoles) {
    return hasRole(navRoles, userRole);
  }

  // Se não tem nenhuma restrição, permite acesso
  return true;
}

export function defineCanNav<TExtra extends object = object>(
  nav: NavNode<TExtra>[],
  permissions: Record<string, string[]> | null,
  userRole: string | null | undefined = undefined,
): NavNode<TExtra>[] {
  return nav.reduce<NavNode<TExtra>[]>((acc, item) => {
    if (!hasAccess(item.permissions, item.role, permissions, userRole ?? null))
      return acc;

    acc.push(
      item.items?.length
        ? {
            ...item,
            items: defineCanNav(item.items, permissions, userRole),
          }
        : item,
    );

    return acc;
  }, []);
}
