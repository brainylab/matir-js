import type { MatirPermission, MatirPermissions } from "./types";

export function defineSchema<T extends MatirPermissions>(schema: T) {
  return schema;
}

/**
 * Tipo para o objeto no array com id
 */
export type SchemaArrayItem = MatirPermission & {
  id: string;
  sub?: MatirPermissions | SchemaArrayItem[];
};

export function schemaToArray<T extends MatirPermissions>(schema: T) {
  return Object.entries(schema).map(([key, value]) => {
    const item: SchemaArrayItem = {
      id: key,
      ...value,
    };

    if (value.sub) {
      item.sub = schemaToArray(value.sub);
    }

    return item;
  });
}
