"use client";

import type { RegisteredAbility } from "./matir-context";

import { useAbility } from "./matir-context";

type CanSubject = Parameters<RegisteredAbility["can"]>[0];

type CanAction<S extends CanSubject> = Parameters<
  RegisteredAbility["can"] extends (
    subject: S,
    action: infer A,
    ...args: any[]
  ) => boolean
    ? (subject: S, action: A, ...args: any[]) => boolean
    : never
>[1];

type CanCondition<S extends CanSubject, A extends CanAction<S>> = Parameters<
  RegisteredAbility["can"] extends (
    subject: S,
    action: A,
    condition: infer C,
    ...args: any[]
  ) => boolean
    ? (subject: S, action: A, condition: C, ...args: any[]) => boolean
    : never
>[2];

export type CanRenderProp = (allowed: boolean) => React.ReactNode;

type CanBaseProps<S extends CanSubject, A extends CanAction<S>> = {
  actions?: A;
  subject: S;
  condition?: CanCondition<S, A>;
  context?: unknown;
};

type CanNormalProps<
  S extends CanSubject,
  A extends CanAction<S>,
> = CanBaseProps<S, A> & {
  passThrough?: false;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type CanPassThroughProps<
  S extends CanSubject,
  A extends CanAction<S>,
> = CanBaseProps<S, A> & {
  passThrough: true;
  children: CanRenderProp; // ← tipado explicitamente, resolve o erro
  fallback?: never;
};

type CanProps<S extends CanSubject, A extends CanAction<S>> =
  | CanNormalProps<S, A>
  | CanPassThroughProps<S, A>;

export function Can<S extends CanSubject, A extends CanAction<S>>(
  props: CanProps<S, A>,
) {
  const ability = useAbility();

  const allowed = ability.can(
    props.subject as any,
    props.actions as any,
    props.condition as any,
    props.context as any,
  );

  if (props.passThrough) {
    return <>{props.children(allowed)}</>;
  }

  return <>{allowed ? props.children : (props.fallback ?? null)}</>;
}
