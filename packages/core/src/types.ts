import type { MatirSchemaDefinition } from "./helpers/defineSchema";

// Tipo para roles - apenas objeto agora
export type RolesDefinition = Record<string, string>;

// Tipo para actions - apenas objeto agora
export type ActionsDefinition = Record<string, string>;

export type MatirSubject = string;

export type MatirConditions = string | number | boolean;

// Condition pode ser valor estático ou função com contexto
export type MatirCondition<TContext = unknown> =
  | Record<string, MatirConditions>
  | ((context: TContext) => boolean);

export type MatirPermission<
  TRoles extends RolesDefinition = RolesDefinition,
  TActions extends ActionsDefinition = ActionsDefinition,
> = {
  name?: string;
  description?: string;
  reasons?: string;
  roles?: (keyof TRoles)[];
  actions?: (keyof TActions)[];
  conditions?: Record<string, MatirConditions>;
};

export type MatirPermissions<
  TRoles extends RolesDefinition = RolesDefinition,
  TActions extends ActionsDefinition = ActionsDefinition,
> = {
  [key: MatirSubject]: {
    sub?: MatirPermissions<TRoles, TActions>;
  } & MatirPermission<TRoles, TActions>;
};

export type MatirCurrentRole<TRoles extends RolesDefinition = RolesDefinition> =
  | keyof TRoles
  | null;

export type MatirCurrentPermissions<
  TActions extends ActionsDefinition = ActionsDefinition,
> = {
  [key: MatirSubject]: (keyof TActions)[];
};

// Tipo recursivo para extrair todos os subjects incluindo nested
export type ExtractSubjects<T extends MatirPermissions<any, any>> = {
  [K in keyof T]: K extends string
    ? T[K] extends { sub: infer Sub }
      ? Sub extends MatirPermissions<any, any>
        ? K | `${K}.${ExtractSubjects<Sub>}`
        : K
      : K
    : never;
}[keyof T];

// Tipo utilitário para extrair as actions de um subject específico
type GetSubjectByPath<
  T extends MatirPermissions<any, any>,
  Path extends string,
> = Path extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? T[First] extends { sub: infer Sub }
      ? Sub extends MatirPermissions<any, any>
        ? GetSubjectByPath<Sub, Rest>
        : never
      : never
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

// Extrair as actions de um subject específico
export type ExtractActionsFromSubject<
  T extends MatirPermissions<any, any>,
  Subject extends ExtractSubjects<T>,
  TActions extends ActionsDefinition,
> = GetSubjectByPath<T, Subject> extends { actions: infer Actions }
  ? Actions extends readonly (infer Action)[]
    ? Action
    : never
  : keyof TActions;

// Normaliza tipos literais para seus tipos base
// true | false → boolean
// 123 → number
// "hello" → string
type NormalizeValue<T> = T extends boolean
  ? boolean
  : T extends number
    ? number
    : T extends string
      ? string
      : T;

// Normaliza um objeto de conditions, convertendo literais para tipos base
type NormalizeConditions<T> = {
  [K in keyof T]: NormalizeValue<T[K]>;
};

// Verifica se um subject tem conditions definidas
export type HasConditions<
  T extends MatirPermissions<any, any>,
  Subject extends ExtractSubjects<T>,
> = GetSubjectByPath<T, Subject> extends { conditions: infer Conditions }
  ? Conditions extends Record<string, MatirConditions>
    ? true
    : false
  : false;

// Extrai as conditions de um subject específico (com tipos normalizados)
export type ExtractConditionsFromSubject<
  T extends MatirPermissions<any, any>,
  Subject extends ExtractSubjects<T>,
> = GetSubjectByPath<T, Subject> extends { conditions: infer Conditions }
  ? Conditions extends Record<string, MatirConditions>
    ? NormalizeConditions<Conditions>
    : never
  : never;

// Tipo para o parâmetro condition baseado no schema
export type ExtractConditionType<
  T extends MatirPermissions<any, any>,
  Subject extends ExtractSubjects<T>,
  TContext = unknown,
> = HasConditions<T, Subject> extends true
  ? ExtractConditionsFromSubject<T, Subject> | ((context: TContext) => boolean)
  : MatirCondition<TContext>;

export type InferPermissionsMap<
  TRules extends MatirPermissions<any, any>,
  TActions extends ActionsDefinition,
> = {
  [S in ExtractSubjects<TRules>]?: ExtractActionsFromSubject<
    TRules,
    S,
    TActions
  >[];
};

export type InferPermissions<
  TSchema extends MatirSchemaDefinition<
    RolesDefinition,
    ActionsDefinition,
    MatirPermissions<RolesDefinition, ActionsDefinition>
  >,
> =
  TSchema extends MatirSchemaDefinition<
    infer _TRoles,
    infer TActions,
    infer TRules
  >
    ? InferPermissionsMap<TRules, TActions>
    : never;
