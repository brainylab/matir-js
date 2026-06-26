# @matir-js/react

## 0.8.0

### Minor Changes

- [`22039a7`](https://github.com/brainylab/matir-js/commit/22039a72068ee887d89ab41d5f232047c3d69805) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - Adicionar suporte a validação de roles em navegação
  
  Add role-based access control to nav filtering logic. Implements hasRole and hasAccess functions to validate both permissions and roles with AND logic when both are present. Updates tests and hooks to support user role checking across navigation items and nested structures.

## 0.7.6

### Patch Changes

- [`e7ee4c8`](https://github.com/brainylab/matir-js/commit/e7ee4c8341a581f6b5a2c638a436df6463c6f306) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - Renomear métodos removendo prefixo "handle"

## 0.7.5

### Patch Changes

- [`b50fb07`](https://github.com/brainylab/matir-js/commit/b50fb0718943ab221f100607bb53c7a0bacdbd1f) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - Adicionar efeito para sincronizar estado com permissões

## 0.7.4

### Patch Changes

- [`37218f2`](https://github.com/brainylab/matir-js/commit/37218f211138200370b28c4f3d9df8b3a2a79bc1) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - ajustes dos types do projeto

- Updated dependencies [[`37218f2`](https://github.com/brainylab/matir-js/commit/37218f211138200370b28c4f3d9df8b3a2a79bc1)]:
  - @matir-js/core@0.8.2

## 0.7.3

### Patch Changes

- [`bc4dcb3`](https://github.com/brainylab/matir-js/commit/bc4dcb316a1a50c0921ddf9ce82b9722b0c3b882) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - correção do type ao exportar o useArrayList

## 0.7.2

### Patch Changes

- [`39dd39b`](https://github.com/brainylab/matir-js/commit/39dd39b03f6a50355f4066504ae6d046b0d23865) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - exportado os novos hooks

## 0.7.1

### Patch Changes

- [`7ea0fbb`](https://github.com/brainylab/matir-js/commit/7ea0fbbaaae287c220a0573036de537f4b2d9bfd) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - alterado a forma como o useManipulation recebe as permissões, agora sendo passado por parametro

## 0.7.0

### Minor Changes

- [`e78f506`](https://github.com/brainylab/matir-js/commit/e78f506c7bd44229908d6429829bc105bf38adaa) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - @matir-js/react

  **Novo hook `useManipulation`**

  Adicionado hook para gerenciamento de estado de permissões em interfaces de edição de roles/subjects.

  - **`buildState`** — converte a lista de rules do `schemaToArray` combinada com as permissões atuais do usuário em um array de `RuleWithActive`, onde cada action recebe um `active: boolean` (`true` se a action está na permissão do usuário, `false` caso contrário) e cada rule recebe uma propriedade `path` com o caminho completo dot-notation (ex: `"products.reference"`) pronto para lookup direto

  - **`handleToggleAction(path, actionId, active)`** — atualiza o estado de uma action específica de forma imutável e retorna `Record<string, string[]>` com as actions ativas do subject alterado

  - **`handleSelectAll(path)`** — ativa todas as actions de um subject e retorna `Record<string, string[]>` com todas as action ids

  - **`handleDeselectAll(path)`** — desativa todas as actions de um subject e retorna `Record<string, string[]>` vazio para aquele path

  - Todas as funções de manipulação de estado são **puras** (sem mutação), operam recursivamente sobre a árvore de `sub` e calculam o retorno de forma síncrona antes do `setState`, eliminando dependência do ciclo de atualização do React

  **Novos tipos exportados**

  - `RuleWithActive` — extensão de `SchemaArrayItem` com `path: string` e `actions` tipadas com `active: boolean`

  **Testes**

  - Adicionados testes para `useArrayList` cobrindo retorno do `schemaToArray` e chamada com o schema do contexto
  - Adicionados testes para `useManipulation` cobrindo inicialização do estado (`buildState`), path de rules top-level e nested, `handleToggleAction`, `handleSelectAll` e `handleDeselectAll` incluindo casos com `sub` recursivo e path inexistente
  - Adicionados testes para o componente `Can` cobrindo modo normal (children, fallback, null), modo `passThrough` com render prop e argumentos passados para `ability.can`
  - Adicionados testes para `MatirProvider`, `useCurrent` e `useAbility` cobrindo inicialização, `setRole`, `setPermissions`, `clearAll`, `getPermission`, `getPermissions` e throws fora do provider

### Patch Changes

- [`8fe4f37`](https://github.com/brainylab/matir-js/commit/8fe4f379ebf34662b367ff817066dfb8a30f8b7b) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix: correção do fallback de actions que ùando não cadastrava, mostrava opções não reais do schema principal

## 0.6.2

### Patch Changes

- [`545b8f6`](https://github.com/brainylab/matir-js/commit/545b8f61736df288440dfa185daa59a78029468f) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - Filter nav using permissions map and useCurrent

## 0.6.1

### Patch Changes

- [`b849a09`](https://github.com/brainylab/matir-js/commit/b849a0916f9c5082807024f2e6ff5aa577a55d77) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - ajustes ao exportar os hooks que nãoe stavam sendo exportados corretamente

## 0.6.0

### Minor Changes

- [`7830ded`](https://github.com/brainylab/matir-js/commit/7830ded642765c587a9dfcf77b5a5976b37f93d3) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - Update React testing setup and dependencies

  Add testing libraries and jsdom, configure Vitest with jsdom environment,
  and rename parameter for clarity in defineCanNav function.

## 0.5.0

### Minor Changes

- [`a58b09e`](https://github.com/brainylab/matir-js/commit/a58b09e291cac1dbbb611e2fe32bd639a823eac7) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - feat: criado novo helper defineCanNav que criar um objeot para nav que já faz a validação pelas informações fornecidas no schema do nav

## 0.4.1

### Patch Changes

- [`c04443e`](https://github.com/brainylab/matir-js/commit/c04443eeff5851415b4c7e90131de5ef9428a765) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - ajustes nos types generics passados para o defineNav, não estava funcionando types condicionais

## 0.4.0

### Minor Changes

- [`0c6692f`](https://github.com/brainylab/matir-js/commit/0c6692f1ab6b640f57cd49c1bbd7783e54cd833c) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - adicionado novo helper para definição do esqueleto de um nav para projetos react

### Patch Changes

- Updated dependencies [[`0f5ad93`](https://github.com/brainylab/matir-js/commit/0f5ad93c54aa2b628a07d9b2cb9fa1164792f737)]:
  - @matir-js/core@0.8.1

## 0.3.0

### Minor Changes

- [`b5c90b7`](https://github.com/brainylab/matir-js/commit/b5c90b7290c770a781820c744116e51fdef1180f) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - feat: adicionado duas novas helpers para obter as permissoes no core e no hooks getCurrent

### Patch Changes

- Updated dependencies [[`b5c90b7`](https://github.com/brainylab/matir-js/commit/b5c90b7290c770a781820c744116e51fdef1180f)]:
  - @matir-js/core@0.8.0

## 0.2.1

### Patch Changes

- [`f0a5429`](https://github.com/brainylab/matir-js/commit/f0a542915336d6a18c0a7ff3302aff6799b62c85) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix: correcão do type ao exportar no hook useCurrent

## 0.2.0

### Minor Changes

- [`4d34e5c`](https://github.com/brainylab/matir-js/commit/4d34e5c0867c90d0718b3f95c39440a7c4e347b4) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - feat: adicionado novos helper de types para tipas o retorno das permissões no hook useCurrent

### Patch Changes

- Updated dependencies [[`4d34e5c`](https://github.com/brainylab/matir-js/commit/4d34e5c0867c90d0718b3f95c39440a7c4e347b4)]:
  - @matir-js/core@0.7.0

## 0.1.4

### Patch Changes

- [`0bb47c7`](https://github.com/brainylab/matir-js/commit/0bb47c780152ca1ea1291c8bd7f1844bd9fcaa1b) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - feat: adicionado as permissoes no userCurrent

## 0.1.3

### Patch Changes

- [`816373d`](https://github.com/brainylab/matir-js/commit/816373dfcb3bb2e70a4c30da91a464cd8adceb70) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - feat: exportado o matir core diretamente do pacote react

## 0.1.2

### Patch Changes

- [`6d47383`](https://github.com/brainylab/matir-js/commit/6d47383b705d508bc03861033d6163fa2a664ce1) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix: correção no build do projeto

## 0.1.1

### Patch Changes

- [`741380c`](https://github.com/brainylab/matir-js/commit/741380c48b57df3be0dd18904f54d108a63efb17) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - fix: correção no package.json, removido a propriedade packages do clen-package

## 0.1.0

### Minor Changes

- [`64b2ad6`](https://github.com/brainylab/matir-js/commit/64b2ad621aec5b99838dd48d4358d420b6a2b0fc) Thanks [@andrefelipeschulle](https://github.com/andrefelipeschulle)! - feat: iniciando novo pacote para integração do matir com react

### Patch Changes

- Updated dependencies [[`01be910`](https://github.com/brainylab/matir-js/commit/01be910669259a57a269fb61bc5b3a3726432b73)]:
  - @matir-js/core@0.6.0
