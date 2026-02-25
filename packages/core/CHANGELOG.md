# @matir-js/core

## 0.5.1

### Patch Changes

- [`de3dd47`](https://github.com/brainylab/matir-js/commit/de3dd474133cb532ef437470bf82fea294d98fc9) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix: ajustes dos types na função de diffPermission

## 0.5.0

### Minor Changes

- [`55c5393`](https://github.com/brainylab/matir-js/commit/55c539355a6315a12770d6a044d1264ce2251a18) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - Move schema helpers and rename permission type

  Replace core's helper.ts with new helpers modules (defineSchema,
  schemaToArray and diffPermissions) and remove helper.spec. Move
  RolesDefinition and ActionsDefinition into types.ts and rename
  MatirUserPermissions to MatirCurrentPermissions. Update core and cache
  to use the new types, remove a stray console.log, and export
  diffPermissions from index.

- [`359fae4`](https://github.com/brainylab/matir-js/commit/359fae4f76831b197c5aee4131015587baf696d1) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - correção na tipagem das funções para definir a current role e permission

## 0.4.0

### Minor Changes

- [`fcd5d69`](https://github.com/brainylab/matir-js/commit/fcd5d693d42d5998ab6d62e33a4091e7d480664e) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - Use object maps for roles and actions

  Replace array-based TRoles/TActions with RolesDefinition and
  ActionsDefinition (Record<string,string>). Add helpers to convert role/action
  objects to arrays for schemaToArray. Make MatirCache generic over roles/actions
  and adjust MatirCore types/usages. Update tests to use object maps and tweak
  biome.json lint settings.

## 0.3.0

### Minor Changes

- [#5](https://github.com/brainylab/matir-js/pull/5) [`63b0ab7`](https://github.com/brainylab/matir-js/commit/63b0ab73f65dbed9a3849826911949a084923bc3) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - refatorado o projeto para uma nova api aonde definimos as roles e as actions possiveis no defineSchema e ele propaga as types no projeto

## 0.2.0

### Minor Changes

- [`c5ead45`](https://github.com/brainylab/matir-js/commit/c5ead45711a4fecc9b272402151dcce183b2c545) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - adicionado novo helper para a transformação do schema de objeto para Array

## 0.1.2

### Patch Changes

- [`d750085`](https://github.com/brainylab/matir-js/commit/d750085ca6f25468180e25d4eec8e17d553d5562) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix: ajustes no types do projeto

## 0.1.1

### Patch Changes

- [`7dd200b`](https://github.com/brainylab/matir-js/commit/7dd200b57d146325a1f6851a95a0584f1a4f80e9) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix: export types from package

## 0.1.0

### Minor Changes

- [`92e0c6e`](https://github.com/brainylab/matir-js/commit/92e0c6e0a882448f1ed335728ce48dcbd928735b) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - feat: Add typed conditions and overloads to Matir core

### Patch Changes

- [`bf62a6f`](https://github.com/brainylab/matir-js/commit/bf62a6f3e408ff9abf849bcc041b001abad1ddd0) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix build and publish package
