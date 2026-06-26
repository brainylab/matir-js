import type { ExtractSubjects, MatirPermissions, matir } from "@matir-js/core";
import type { MatirRegister } from "../matirContext";

type Schema = ReturnType<typeof matir.defineSchema>;

type RegisteredSchema = MatirRegister extends { schema: infer S }
  ? S extends Schema
    ? S
    : Schema
  : Schema;

type RegisteredRules = RegisteredSchema["rules"];

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

type ExtractNavAction<
  TRules extends MatirPermissions<any, any>,
  Subject extends string,
> =
  GetSubjectByPath<TRules, Subject> extends { actions: infer Actions }
    ? Actions extends readonly (infer Action)[]
      ? Action
      : never
    : never; // sem actions → never

export type NavPermissions = {
  // key remapping: subjects com never são removidos do tipo completamente
  [S in ExtractSubjects<RegisteredRules> as ExtractNavAction<
    RegisteredRules,
    S
  > extends never
    ? never
    : S]?: ExtractNavAction<RegisteredRules, S>;
};

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type NavNode<TExtra extends object = object> = {
  permissions?: NavPermissions;
  role?: string[];
  items?: NavNode<TExtra>[];
} & DistributiveOmit<TExtra, "permissions" | "items" | "role">;

export function defineNav<TExtra extends object = object>(
  items: NavNode<TExtra>[],
): NavNode<TExtra>[] {
  return items;
}
