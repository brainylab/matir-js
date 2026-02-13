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

// Condition pode ser valor estático ou função com contexto
export type MatirCondition<TContext = unknown> =
  | Record<string, boolean>
  | ((context: TContext) => boolean);

export type MatirPermission = {
  name?: string;
  reasons?: string;
  roles?: MatirRole[];
  actions?: MatirAction[];
  conditions?: Record<string, boolean>;
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
