import type { MatirSchemaDefinition } from "./helpers/defineSchema";
import type {
  ActionsDefinition,
  ExtractActionsFromSubject,
  ExtractConditionsFromSubject,
  ExtractPermissionsByWildcard,
  ExtractSubjects,
  ExtractWildcardSubjects,
  HasConditions,
  MatirConditions,
  MatirCurrentPermissions,
  MatirPermissions,
  RolesDefinition,
} from "./types";

import { MatirCache } from "./cache";

export class MatirCore<
  TRoles extends RolesDefinition,
  TActions extends ActionsDefinition,
  TRules extends MatirPermissions<TRoles, TActions>,
  TContext = unknown,
> {
  private schema: MatirCache<TRoles, TActions>;
  private roles: TRoles;
  private currentRole: keyof TRoles | null = null;
  private currentPermissions: MatirCurrentPermissions<TActions> = {};

  constructor(
    schemaDefinition: MatirSchemaDefinition<TRoles, TActions, TRules>,
  ) {
    this.roles = schemaDefinition.roles || {};
    this.schema = MatirCache.create<TRoles, TActions>(schemaDefinition.rules);
  }

  setCurrentRole(role: string) {
    this.currentRole = role as keyof TRoles;

    return this.getCurrentRole();
  }

  setCurrentPermissions(permissions: Record<string, string[]>): void {
    this.currentPermissions = permissions as MatirCurrentPermissions<TActions>;
  }

  getCurrentRole() {
    return {
      value: this.currentRole,
      description: this.currentRole ? this.roles[this.currentRole] : null,
    };
  }

  getCurrentPermission<S extends ExtractSubjects<TRules>>(
    subject: S,
  ): ExtractActionsFromSubject<TRules, S, TActions>[] | null {
    const permissions = this.currentPermissions[subject as string];
    if (!permissions) return null;
    return permissions as ExtractActionsFromSubject<TRules, S, TActions>[];
  }

  getCurrentPermissions<P extends ExtractWildcardSubjects<TRules>>(
    pattern: P,
  ): ExtractPermissionsByWildcard<TRules, TActions, P> {
    const prefix = (pattern as string).replace(".*", "");

    const entries = Object.entries(this.currentPermissions)
      .filter(([key]) => key === prefix || key.startsWith(`${prefix}.`))
      .map(([key, actions]) => ({ key, actions }));

    return entries as ExtractPermissionsByWildcard<TRules, TActions, P>;
  }

  getCurrent(): {
    role: keyof TRoles | null;
    permissions: MatirCurrentPermissions<TActions>;
  } {
    return { role: this.currentRole, permissions: this.currentPermissions };
  }

  clearCurrent(): void {
    this.currentRole = null;
    this.currentPermissions = {} as MatirCurrentPermissions<TActions>;
  }

  // Sobrecarga 1: condition é FUNÇÃO com action → context é OBRIGATÓRIO e tipo é INFERIDO
  can<S extends ExtractSubjects<TRules>, C>(
    subject: S,
    action: ExtractActionsFromSubject<TRules, S, TActions>,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 2: condition é FUNÇÃO sem action → context é OBRIGATÓRIO e tipo é INFERIDO
  can<S extends ExtractSubjects<TRules>, C>(
    subject: S,
    action: undefined,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 3: subject COM conditions + COM action + condition OBRIGATÓRIA (objeto tipado)
  can<S extends ExtractSubjects<TRules>>(
    subject: HasConditions<TRules, S> extends true ? S : never,
    action: ExtractActionsFromSubject<TRules, S, TActions>,
    condition: Partial<ExtractConditionsFromSubject<TRules, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 4: subject COM conditions + SEM action + condition OBRIGATÓRIA (objeto tipado)
  can<S extends ExtractSubjects<TRules>>(
    subject: HasConditions<TRules, S> extends true ? S : never,
    action: undefined,
    condition: Partial<ExtractConditionsFromSubject<TRules, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 5: subject SEM conditions
  can<S extends ExtractSubjects<TRules>>(
    subject: HasConditions<TRules, S> extends false ? S : never,
    action?: ExtractActionsFromSubject<TRules, S, TActions>,
    condition?: Record<string, MatirConditions>,
    context?: TContext,
  ): boolean;

  // Implementação
  can<S extends ExtractSubjects<TRules>, C = any>(
    subject: S,
    action: ExtractActionsFromSubject<TRules, S, TActions> | undefined,
    condition?:
      | Partial<ExtractConditionsFromSubject<TRules, S>>
      | Record<string, MatirConditions>
      | ((context: C) => boolean),
    context?: TContext | C,
  ): boolean {
    // 1. Busca a permissão do subject no schema
    const permission = this.schema.get(subject as string);

    if (!permission) {
      return false;
    }

    // 2. Verifica roles (usa as roles definidas no setCurrent)
    if (permission.roles && permission.roles.length > 0) {
      if (!this.currentRole) {
        return false;
      }
      if (!permission.roles.includes(this.currentRole as string)) {
        return false;
      }
    }

    if (action) {
      if (permission.actions && permission.actions.length > 0) {
        if (this.currentPermissions[subject]) {
          if (!this.currentPermissions[subject].includes(action as any)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    // Se o subject tem conditions no schema, condition é obrigatória
    if (
      permission.conditions &&
      Object.keys(permission.conditions).length > 0
    ) {
      if (condition === undefined) {
        return false;
      }
    }

    if (condition !== undefined) {
      // Condition como função
      if (typeof condition === "function") {
        const conditionResult = condition(context as any);
        if (!conditionResult) {
          return false;
        }
      }
      // Condition como objeto
      else {
        if (Object.keys(condition).length > 0) {
          if (!permission.conditions) {
            return false;
          }
          const allConditionsMet = Object.entries(condition).every(
            ([key, value]) => permission.conditions?.[key] === value,
          );
          if (!allConditionsMet) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Verifica se o usuário NÃO tem permissão
   */
  // Sobrecarga 1: condition é FUNÇÃO com action → context é OBRIGATÓRIO e tipo é INFERIDO
  cannot<S extends ExtractSubjects<TRules>, C>(
    subject: S,
    action: ExtractActionsFromSubject<TRules, S, TActions>,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 2: condition é FUNÇÃO sem action → context é OBRIGATÓRIO e tipo é INFERIDO
  cannot<S extends ExtractSubjects<TRules>, C>(
    subject: S,
    action: undefined,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 3: subject COM conditions + COM action + condition OBRIGATÓRIA (objeto tipado)
  cannot<S extends ExtractSubjects<TRules>>(
    subject: HasConditions<TRules, S> extends true ? S : never,
    action: ExtractActionsFromSubject<TRules, S, TActions>,
    condition: Partial<ExtractConditionsFromSubject<TRules, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 4: subject COM conditions + SEM action + condition OBRIGATÓRIA (objeto tipado)
  cannot<S extends ExtractSubjects<TRules>>(
    subject: HasConditions<TRules, S> extends true ? S : never,
    action: undefined,
    condition: Partial<ExtractConditionsFromSubject<TRules, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 5: subject SEM conditions
  cannot<S extends ExtractSubjects<TRules>>(
    subject: HasConditions<TRules, S> extends false ? S : never,
    action?: ExtractActionsFromSubject<TRules, S, TActions>,
    condition?: Record<string, MatirConditions>,
    context?: TContext,
  ): boolean;

  // Implementação - precisa ser compatível com TODAS as sobrecargas
  cannot<S extends ExtractSubjects<TRules>, C = any>(
    subject: S,
    action: ExtractActionsFromSubject<TRules, S, TActions> | undefined,
    condition?:
      | Partial<ExtractConditionsFromSubject<TRules, S>>
      | Record<string, MatirConditions>
      | ((context: C) => boolean),
    context?: TContext | C,
  ): boolean {
    return !this.can(subject, action as any, condition as any, context as any);
  }

  static createSchema<
    const TRoles extends RolesDefinition,
    const TActions extends ActionsDefinition,
    const TRules extends MatirPermissions<TRoles, TActions>,
    TContext = unknown,
  >(schemaDefinition: MatirSchemaDefinition<TRoles, TActions, TRules>) {
    const instance = new MatirCore<TRoles, TActions, TRules, TContext>(
      schemaDefinition,
    );

    const ability = {
      can: instance.can.bind(instance),
      cannot: instance.cannot.bind(instance),
    };

    const current = {
      role: instance.setCurrentRole.bind(instance),
      permissions: instance.setCurrentPermissions.bind(instance),
      clear: instance.clearCurrent.bind(instance),
      get: instance.getCurrent.bind(instance),
      getRole: instance.getCurrentRole.bind(instance),
      getPermission: instance.getCurrentPermission.bind(instance),
      getPermissions: instance.getCurrentPermissions.bind(instance),
    };

    return { ability, current };
  }
}
