export interface MatirRoleMap {
  super_admin: "super_admin";
  admin: "admin";
}

export interface MatirActionMap {
  create: "create";
  read: "read";
  update: "update";
  delete: "delete";
}

// Extrair as roles e actions das interfaces
export type MatirRole = MatirRoleMap[keyof MatirRoleMap];
export type MatirAction = MatirActionMap[keyof MatirActionMap];

export type MatirSubject = string;

export type MatirConditions = string | number | boolean;

// Condition pode ser valor estático ou função com contexto
export type MatirCondition<TContext = unknown> =
  | Record<string, MatirConditions>
  | ((context: TContext) => boolean);

export type MatirPermission = {
  name?: string;
  reasons?: string;
  roles?: MatirRole[];
  actions?: MatirAction[];
  conditions?: Record<string, MatirConditions>;
};

export type MatirPermissions = {
  [key: MatirSubject]: {
    sub?: MatirPermissions;
  } & MatirPermission;
};

export type MatirUserPermissions = {
  [key: MatirSubject]: MatirAction[];
};

// Tipo recursivo para extrair todos os subjects incluindo nested
export type ExtractSubjects<T extends MatirPermissions> = {
  [K in keyof T]: K extends string
    ? T[K] extends { sub: infer Sub }
      ? Sub extends MatirPermissions
        ? K | `${K}.${ExtractSubjects<Sub>}`
        : K
      : K
    : never;
}[keyof T];

// Tipo utilitário para extrair as actions de um subject específico
type GetSubjectByPath<
  T extends MatirPermissions,
  Path extends string,
> = Path extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? T[First] extends { sub: infer Sub }
      ? Sub extends MatirPermissions
        ? GetSubjectByPath<Sub, Rest>
        : never
      : never
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

// Extrair as actions de um subject específico
export type ExtractActionsFromSubject<
  T extends MatirPermissions,
  Subject extends ExtractSubjects<T>,
> = GetSubjectByPath<T, Subject> extends { actions: infer Actions }
  ? Actions extends readonly (infer Action)[]
    ? Action
    : never
  : MatirAction;

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
  T extends MatirPermissions,
  Subject extends ExtractSubjects<T>,
> = GetSubjectByPath<T, Subject> extends { conditions: infer Conditions }
  ? Conditions extends Record<string, MatirConditions>
    ? true
    : false
  : false;

// Extrai as conditions de um subject específico (com tipos normalizados)
export type ExtractConditionsFromSubject<
  T extends MatirPermissions,
  Subject extends ExtractSubjects<T>,
> = GetSubjectByPath<T, Subject> extends { conditions: infer Conditions }
  ? Conditions extends Record<string, MatirConditions>
    ? NormalizeConditions<Conditions>
    : never
  : never;

// Tipo para o parâmetro condition baseado no schema
export type ExtractConditionType<
  T extends MatirPermissions,
  Subject extends ExtractSubjects<T>,
  TContext = unknown,
> = HasConditions<T, Subject> extends true
  ? ExtractConditionsFromSubject<T, Subject> | ((context: TContext) => boolean)
  : MatirCondition<TContext>;
