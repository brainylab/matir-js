import type { ActionsDefinition, RolesDefinition } from "./helper";
import type { MatirPermission, MatirPermissions } from "./types";

export class MatirCache<
  TRoles extends RolesDefinition = RolesDefinition,
  TActions extends ActionsDefinition = ActionsDefinition,
> {
  private cache: Map<string, MatirPermission<TRoles, TActions>>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): MatirPermission<TRoles, TActions> | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  populate(
    permissions: MatirPermissions<TRoles, TActions>,
    prefix: string = "",
  ) {
    for (const [key, value] of Object.entries(permissions)) {
      const cacheKey = prefix ? `${prefix}.${key}` : key;

      const { sub, ...permissionData } = value;

      this.cache.set(
        cacheKey,
        permissionData as MatirPermission<TRoles, TActions>,
      );

      if (sub) {
        this.populate(sub, cacheKey);
      }
    }
  }

  static create<
    TRoles extends RolesDefinition,
    TActions extends ActionsDefinition,
  >(
    permissions?: MatirPermissions<TRoles, TActions>,
  ): MatirCache<TRoles, TActions> {
    const cache = new MatirCache<TRoles, TActions>();

    if (permissions) {
      cache.populate(permissions);
    }

    return cache;
  }
}
