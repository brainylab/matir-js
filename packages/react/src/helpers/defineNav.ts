import type {
  ExtractActionsFromSubject,
  ExtractSubjects,
  matir,
} from "@matir-js/core";
import type { MatirRegister } from "../matir-context";

type Schema = ReturnType<typeof matir.defineSchema>;

type RegisteredSchema = MatirRegister extends { schema: infer S }
  ? S extends Schema
    ? S
    : Schema
  : Schema;

type RegisteredActions = RegisteredSchema["actions"];
type RegisteredRules = RegisteredSchema["rules"];

export type NavPermissions = {
  [S in ExtractSubjects<RegisteredRules>]?: ExtractActionsFromSubject<
    RegisteredRules,
    S,
    RegisteredActions
  >;
};

export type NavNode<TExtra extends object = object> = {
  permissions: NavPermissions;
  items?: NavNode<TExtra>[];
} & Omit<TExtra, "permissions" | "items">;

export function defineNav<TExtra extends object = object>(
  items: NavNode<TExtra>[],
): NavNode<TExtra>[] {
  return items;
}
