import type { MatirPermissions } from "./types";

export function defineSchema<T extends MatirPermissions>(schema: T) {
  return schema;
}
