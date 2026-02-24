---
"@matir-js/core": minor
---

Use object maps for roles and actions

Replace array-based TRoles/TActions with RolesDefinition and
ActionsDefinition (Record<string,string>). Add helpers to convert role/action
objects to arrays for schemaToArray. Make MatirCache generic over roles/actions
and adjust MatirCore types/usages. Update tests to use object maps and tweak
biome.json lint settings.
