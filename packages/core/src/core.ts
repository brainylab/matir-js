import type {
  ExtractActionsFromSubject,
  ExtractConditionsFromSubject,
  ExtractSubjects,
  HasConditions,
  MatirConditions,
  MatirPermissions,
  MatirRole,
  MatirUserPermissions,
} from "./types";

import { MatirCache } from "./cache";

export class MatirCore<T extends MatirPermissions, TContext = unknown> {
  private schema: MatirCache;
  private currentRoles: MatirRole[] = [];
  private currentPermissions: MatirUserPermissions = {};

  constructor(schema: T) {
    this.schema = MatirCache.create(schema);
  }

  setRole(role: string): void {
    this.currentRoles.push(role as MatirRole);
  }

  setRoles(roles: string[]): void {
    this.currentRoles.push(...(roles as MatirRole[]));
  }

  setPermissions(permissions: Record<string, string[]>): void {
    this.currentPermissions = permissions as MatirUserPermissions;
  }

  getCurrent(): { roles: MatirRole[]; permissions: MatirUserPermissions } {
    return { roles: this.currentRoles, permissions: this.currentPermissions };
  }

  clearCurrent(): void {
    console.log("aqui");
    this.currentRoles = [];
    this.currentPermissions = {};
  }

  // Sobrecarga 1: condition é FUNÇÃO com action → context é OBRIGATÓRIO e tipo é INFERIDO
  can<S extends ExtractSubjects<T>, C>(
    subject: S,
    action: ExtractActionsFromSubject<T, S>,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 2: condition é FUNÇÃO sem action → context é OBRIGATÓRIO e tipo é INFERIDO
  can<S extends ExtractSubjects<T>, C>(
    subject: S,
    action: undefined,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 3: subject COM conditions + COM action + condition OBRIGATÓRIA (objeto tipado)
  can<S extends ExtractSubjects<T>>(
    subject: HasConditions<T, S> extends true ? S : never,
    action: ExtractActionsFromSubject<T, S>,
    condition: Partial<ExtractConditionsFromSubject<T, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 4: subject COM conditions + SEM action + condition OBRIGATÓRIA (objeto tipado)
  can<S extends ExtractSubjects<T>>(
    subject: HasConditions<T, S> extends true ? S : never,
    action: undefined,
    condition: Partial<ExtractConditionsFromSubject<T, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 5: subject SEM conditions
  can<S extends ExtractSubjects<T>>(
    subject: HasConditions<T, S> extends false ? S : never,
    action?: ExtractActionsFromSubject<T, S>,
    condition?: Record<string, MatirConditions>,
    context?: TContext,
  ): boolean;

  // Implementação
  can<S extends ExtractSubjects<T>, C = any>(
    subject: S,
    action: ExtractActionsFromSubject<T, S> | undefined,
    condition?:
      | Partial<ExtractConditionsFromSubject<T, S>>
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
    const rolesToCheck = this.currentRoles;
    // Se o subject tem roles definidas, verifica se o usuário tem pelo menos uma delas

    if (permission.roles && permission.roles.length > 0) {
      if (rolesToCheck.length === 0) {
        // Subject requer roles, mas usuário não tem nenhuma
        return false;
      }
      const hasRole = rolesToCheck.some((userRole) =>
        permission.roles?.includes(userRole),
      );
      if (!hasRole) {
        return false;
      }
    }

    if (action) {
      if (permission.actions && permission.actions.length > 0) {
        if (this.currentPermissions[subject]) {
          if (!this.currentPermissions[subject].includes(action)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    //  revisar condition

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
  cannot<S extends ExtractSubjects<T>, C>(
    subject: S,
    action: ExtractActionsFromSubject<T, S>,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 2: condition é FUNÇÃO sem action → context é OBRIGATÓRIO e tipo é INFERIDO
  cannot<S extends ExtractSubjects<T>, C>(
    subject: S,
    action: undefined,
    condition: (context: C) => boolean,
    context: C,
  ): boolean;

  // Sobrecarga 3: subject COM conditions + COM action + condition OBRIGATÓRIA (objeto tipado)
  cannot<S extends ExtractSubjects<T>>(
    subject: HasConditions<T, S> extends true ? S : never,
    action: ExtractActionsFromSubject<T, S>,
    condition: Partial<ExtractConditionsFromSubject<T, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 4: subject COM conditions + SEM action + condition OBRIGATÓRIA (objeto tipado)
  cannot<S extends ExtractSubjects<T>>(
    subject: HasConditions<T, S> extends true ? S : never,
    action: undefined,
    condition: Partial<ExtractConditionsFromSubject<T, S>>,
    context?: TContext,
  ): boolean;

  // Sobrecarga 5: subject SEM conditions
  cannot<S extends ExtractSubjects<T>>(
    subject: HasConditions<T, S> extends false ? S : never,
    action?: ExtractActionsFromSubject<T, S>,
    condition?: Record<string, MatirConditions>,
    context?: TContext,
  ): boolean;

  // Implementação - precisa ser compatível com TODAS as sobrecargas
  cannot<S extends ExtractSubjects<T>, C = any>(
    subject: S,
    action: ExtractActionsFromSubject<T, S> | undefined,
    condition?:
      | Partial<ExtractConditionsFromSubject<T, S>>
      | Record<string, MatirConditions>
      | ((context: C) => boolean),
    context?: TContext | C,
  ): boolean {
    return !this.can(subject, action as any, condition as any, context as any);
  }

  static createSchema<T extends MatirPermissions, TContext = unknown>(
    schema: T,
  ): {
    ability: {
      can: typeof instance.can;
      cannot: typeof instance.cannot;
    };
    current: {
      role: typeof instance.setRole;
      roles: typeof instance.setRoles;
      permissions: typeof instance.setPermissions;
      clear: typeof instance.clearCurrent;
      get: typeof instance.getCurrent;
    };
  } {
    const instance = new MatirCore<T, TContext>(schema);

    const ability = {
      can: instance.can.bind(instance),
      cannot: instance.cannot.bind(instance),
    };

    const current = {
      role: instance.setRole.bind(instance),
      roles: instance.setRoles.bind(instance),
      permissions: instance.setPermissions.bind(instance),
      clear: instance.clearCurrent.bind(instance),
      get: instance.getCurrent.bind(instance),
    };

    return { ability, current };
  }
}
