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
 * Actions são convertidas para objetos com id e label
 */
export type SchemaArrayItem<
  TRoles extends RolesDefinition = RolesDefinition,
  TActions extends ActionsDefinition = ActionsDefinition,
> = Omit<MatirPermission<TRoles, TActions>, "sub" | "actions"> & {
  id: string;
  actions?: ActionArrayItem[];
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
  actionsDefinition: TActions,
): SchemaArrayItem<TRoles, TActions>[] {
  return Object.entries(rules).map(([key, value]) => {
    const { sub, actions, ...rest } = value;

    const item: SchemaArrayItem<TRoles, TActions> = {
      id: key,
      ...rest,
    };

    // Converte actions de string para objetos com id e label
    if (actions && actions.length > 0) {
      item.actions = actions.map((actionKey) => ({
        id: String(actionKey),
        label: actionsDefinition[actionKey as keyof TActions],
      }));
    }

    if (sub) {
      item.sub = convertRulesToArray(sub, actionsDefinition);
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
    rules: convertRulesToArray(schema.rules, schema.actions),
  };
}
