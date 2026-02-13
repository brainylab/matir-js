import type { MatirPermission, MatirPermissions } from "./types";

export class MatirCache {
  private cache: Map<string, MatirPermission>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): MatirPermission | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  populate(permissions: MatirPermissions, prefix: string = "") {
    for (const [key, value] of Object.entries(permissions)) {
      const cacheKey = prefix ? `${prefix}.${key}` : key;

      const { sub, ...permissionData } = value;

      this.cache.set(cacheKey, permissionData);

      if (sub) {
        this.populate(sub, cacheKey);
      }
    }
  }

  static create<T extends MatirPermissions>(permissions?: T): MatirCache {
    const cache = new MatirCache();

    if (permissions) {
      cache.populate(permissions);
    }

    return cache;
  }
}
