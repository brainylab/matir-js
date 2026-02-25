import { MatirCore } from "./core";
import { defineSchema } from "./helpers/defineSchema";
import { diffPermissions } from "./helpers/diffPermissions";
import { schemaToArray } from "./helpers/schemaToArray";

const matir = MatirCore as typeof MatirCore & {
  defineSchema: typeof defineSchema;
  schemaToArray: typeof schemaToArray;
  diffPermissions: typeof diffPermissions;
};

matir.defineSchema = defineSchema;
matir.schemaToArray = schemaToArray;
matir.diffPermissions = diffPermissions;

export { matir, defineSchema, schemaToArray, diffPermissions };
