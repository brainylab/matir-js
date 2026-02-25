import type {
  ActionsDefinition,
  MatirPermission,
  MatirPermissions,
  RolesDefinition,
} from "../types";
import type { MatirSchemaDefinition } from "./defineSchema";

/**
 * Tipo para role/action no array
 */
export type RoleArrayItem = {
  id: string;
  label: string;
};

export type ActionArrayItem = {
  id: string;
  label: string;
};

/**
 * Tipo para o objeto no array com id
 */
export type SchemaArrayItem<
  TRoles extends RolesDefinition = RolesDefinition,
  TActions extends ActionsDefinition = ActionsDefinition,
> = Omit<MatirPermission<TRoles, TActions>, "sub"> & {
  id: string;
  sub?: SchemaArrayItem<TRoles, TActions>[];
};

export type SchemaArrayResult<
  TRoles extends RolesDefinition,
  TActions extends ActionsDefinition,
> = {
  roles: RoleArrayItem[];
  actions: ActionArrayItem[];
  rules: SchemaArrayItem<TRoles, TActions>[];
};

/**
 * Converte o objeto de roles para array
 */
function convertRolesToArray(roles: RolesDefinition): RoleArrayItem[] {
  return Object.entries(roles).map(([key, label]) => ({
    id: key,
    label,
  }));
}

/**
 * Converte o objeto de actions para array
 */
function convertActionsToArray(actions: ActionsDefinition): ActionArrayItem[] {
  return Object.entries(actions).map(([key, label]) => ({
    id: key,
    label,
  }));
}

/**
 * Converte as rules para array recursivamente
 */
function convertRulesToArray<
  TRoles extends RolesDefinition,
  TActions extends ActionsDefinition,
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
  TRoles extends RolesDefinition,
  TActions extends ActionsDefinition,
  TRules extends MatirPermissions<TRoles, TActions>,
>(
  schema: MatirSchemaDefinition<TRoles, TActions, TRules>,
): SchemaArrayResult<TRoles, TActions> {
  return {
    roles: convertRolesToArray(schema.roles),
    actions: convertActionsToArray(schema.actions),
    rules: convertRulesToArray(schema.rules),
  };
}
