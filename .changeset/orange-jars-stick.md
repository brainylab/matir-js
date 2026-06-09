---
"@matir-js/react": minor
---

@matir-js/react

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
