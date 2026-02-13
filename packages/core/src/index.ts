import { MatirCore } from "./core";
import { defineSchema } from "./helper";

export * from "./types";

const matir = MatirCore as typeof MatirCore & {
  defineSchema: typeof defineSchema;
};

matir.defineSchema = defineSchema;

export { matir };
