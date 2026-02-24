import type { MatirPermission, MatirPermissions } from "./types";

export type MatirSchemaDefinition<
  TRoles extends readonly string[],
  TActions extends readonly string[],
  TRules extends MatirPermissions<TRoles, TActions>,
> = {
  roles: TRoles;
  actions: TActions;
  rules: TRules;
};

export function defineSchema<
  const TRoles extends readonly string[],
  const TActions extends readonly string[],
  const TRules extends MatirPermissions<TRoles, TActions>,
>(schema: MatirSchemaDefinition<TRoles, TActions, TRules>) {
  return schema;
}

/**
 * Tipo para o objeto no array com id
 */
export type SchemaArrayItem<
  TRoles extends readonly string[] = readonly string[],
  TActions extends readonly string[] = readonly string[],
> = Omit<MatirPermission<TRoles, TActions>, "sub"> & {
  id: string;
  sub?: SchemaArrayItem<TRoles, TActions>[];
};

export type SchemaArrayResult<
  TRoles extends readonly string[],
  TActions extends readonly string[],
> = {
  roles: TRoles;
  actions: TActions;
  rules: SchemaArrayItem<TRoles, TActions>[];
};

function convertRulesToArray<
  TRoles extends readonly string[],
  TActions extends readonly string[],
>(
  rules: MatirPermissions<TRoles, TActions>,
): SchemaArrayItem<TRoles, TActions>[] {
  return Object.entries(rules).map(([key, value]) => {
    const { sub, ...rest } = value;

    const item: SchemaArrayItem<TRoles, TActions> = {
      id: key,
      ...rest,
    };

    if (sub) {
      item.sub = convertRulesToArray(sub);
    }

    return item;
  });
}

export function schemaToArray<
  TRoles extends readonly string[],
  TActions extends readonly string[],
  TRules extends MatirPermissions<TRoles, TActions>,
>(
  schema: MatirSchemaDefinition<TRoles, TActions, TRules>,
): SchemaArrayResult<TRoles, TActions> {
  return {
    roles: schema.roles,
    actions: schema.actions,
    rules: convertRulesToArray(schema.rules),
  };
}
