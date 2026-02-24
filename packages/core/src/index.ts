import { MatirCore } from "./core";
import { defineSchema, schemaToArray } from "./helper";

const matir = MatirCore as typeof MatirCore & {
  defineSchema: typeof defineSchema;
  schemaToArray: typeof schemaToArray;
};

matir.defineSchema = defineSchema;
matir.schemaToArray = schemaToArray;

export { matir, defineSchema, schemaToArray };
