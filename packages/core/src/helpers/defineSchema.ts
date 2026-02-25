import type {
  ActionsDefinition,
  MatirPermissions,
  RolesDefinition,
} from "../types";

export type MatirSchemaDefinition<
  TRoles extends RolesDefinition,
  TActions extends ActionsDefinition,
  TRules extends MatirPermissions<TRoles, TActions>,
> = {
  roles: TRoles;
  actions: TActions;
  rules: TRules;
};

export function defineSchema<
  const TRoles extends RolesDefinition,
  const TActions extends ActionsDefinition,
  const TRules extends MatirPermissions<TRoles, TActions>,
>(schema: MatirSchemaDefinition<TRoles, TActions, TRules>) {
  return schema;
}
