import { useContext, useState } from "react";

import type {
  ActionArrayItem,
  ActionsDefinition,
  RolesDefinition,
  SchemaArrayItem,
} from "@matir-js/core";

import { MatirContext } from "../matirContext";
import { useArrayList } from "./useArrayList";

type ActionWithActive = ActionArrayItem & { active: boolean };

export type RuleWithActive = Omit<SchemaArrayItem, "actions" | "sub"> & {
  path: string;
  actions?: ActionWithActive[];
  sub?: RuleWithActive[];
};

function buildState(
  ruleList: SchemaArrayItem<RolesDefinition, ActionsDefinition>[],
  permissions: Record<string, string[]>,
  parentPath?: string,
): RuleWithActive[] {
  return ruleList.map((rule) => {
    const currentPath = parentPath ? `${parentPath}.${rule.id}` : rule.id;
    const allowedActions = permissions[currentPath] ?? [];

    return {
      ...rule,
      path: currentPath,
      actions: rule.actions?.map((action) => ({
        ...action,
        active: allowedActions.includes(action.id),
      })),
      sub: rule.sub
        ? buildState(rule.sub, permissions, currentPath)
        : undefined,
    };
  });
}

function setActionActive(
  rules: RuleWithActive[],
  path: string,
  actionId: string,
  active: boolean,
): RuleWithActive[] {
  return rules.map((rule) => {
    if (rule.path === path) {
      return {
        ...rule,
        actions: rule.actions?.map((action) =>
          action.id === actionId ? { ...action, active } : action,
        ),
      };
    }

    if (rule.sub) {
      return {
        ...rule,
        sub: setActionActive(rule.sub, path, actionId, active),
      };
    }

    return rule;
  });
}

function setAllActionsActive(
  rules: RuleWithActive[],
  path: string,
  active: boolean,
): RuleWithActive[] {
  return rules.map((rule) => {
    if (rule.path === path) {
      return {
        ...rule,
        actions: rule.actions?.map((action) => ({ ...action, active })),
      };
    }

    if (rule.sub) {
      return { ...rule, sub: setAllActionsActive(rule.sub, path, active) };
    }

    return rule;
  });
}

function buildSubjectPermissions(
  rules: RuleWithActive[],
  path: string,
): Record<string, string[]> {
  for (const rule of rules) {
    if (rule.path === path) {
      return {
        [rule.path]: (rule.actions ?? [])
          .filter((action) => action.active)
          .map((action) => action.id),
      };
    }

    if (rule.sub) {
      const result = buildSubjectPermissions(rule.sub, path);
      if (Object.keys(result).length) return result;
    }
  }

  return {};
}

type UseManipulationReturn = {
  permissions?: Record<string, string[]>;
};

export function useManipulation(props?: UseManipulationReturn) {
  const ctx = useContext(MatirContext);

  if (!ctx) {
    throw new Error("useManipulation must be used within <MatirProvider />");
  }

  const { rules } = useArrayList();

  const [state, setState] = useState<RuleWithActive[]>(() =>
    buildState(rules, props?.permissions ?? {}),
  );

  function handleToggleAction(path: string, actionId: string, active: boolean) {
    const newState = setActionActive(state, path, actionId, active);
    setState(newState);
    return buildSubjectPermissions(newState, path);
  }

  function handleSelectAll(path: string) {
    const newState = setAllActionsActive(state, path, true);
    setState(newState);
    return buildSubjectPermissions(newState, path);
  }

  function handleDeselectAll(path: string) {
    const newState = setAllActionsActive(state, path, false);
    setState(newState);
    return buildSubjectPermissions(newState, path);
  }

  return {
    rules: state,
    handleToggleAction,
    handleSelectAll,
    handleDeselectAll,
  };
}
