import type {
  ExtractActionsFromSubject,
  ExtractSubjects,
  MatirCondition,
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

  /**
   * Verifica se o usuário tem permissão para acessar um subject com uma action específica
   *
   * Fluxo de validação:
   * 1. Busca o subject no schema
   * 2. Verifica se o usuário tem uma das roles permitidas (setCurrent)
   * 3. Verifica se a action está nas actions permitidas do subject
   * 4. Verifica conditions se fornecidas
   *
   * @param subject - O recurso a ser verificado
   * @param action - A ação a ser realizada no subject
   * @param condition - Condição adicional (objeto ou função)
   * @param context - Contexto para avaliação da condition (se for função)
   */
  can<S extends ExtractSubjects<T>>(
    subject: S,
    action?: ExtractActionsFromSubject<T, S>,
    condition?: MatirCondition<TContext>,
    context?: TContext,
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

    if (condition !== undefined) {
      // Condition como função
      if (typeof condition === "function") {
        if (!context) {
          return false;
        }
        const conditionResult = condition(context);
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
  cannot<S extends ExtractSubjects<T>>(
    subject: S,
    action: ExtractActionsFromSubject<T, S>,
    condition?: MatirCondition<TContext>,
    context?: TContext,
  ): boolean {
    return !this.can(subject, action, condition, context);
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
