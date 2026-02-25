---
"@matir-js/core": minor
---

Move schema helpers and rename permission type

Replace core's helper.ts with new helpers modules (defineSchema,
schemaToArray and diffPermissions) and remove helper.spec. Move
RolesDefinition and ActionsDefinition into types.ts and rename
MatirUserPermissions to MatirCurrentPermissions. Update core and cache
to use the new types, remove a stray console.log, and export
diffPermissions from index.
