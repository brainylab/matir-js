<div align="center">

# 🔐 @matir/core

### Sistema de Permissões TypeScript com Type-Safety

[![npm version](https://img.shields.io/npm/v/@matir/core.svg)](https://www.npmjs.com/package/@matir/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

[Instalação](#-instalação) •
[Características](#-características) •
[Exemplos](#-exemplos) •
[API](#-api) •
[Tipos Personalizados](#-tipos-personalizados)

</div>

---

## 📋 Sobre

**@matir/core** é uma biblioteca TypeScript poderosa e type-safe para gerenciar permissões e controle de acesso em suas aplicações. Com suporte completo a roles, actions, conditions e schemas aninhados, oferece uma solução flexível e intuitiva para RBAC (Role-Based Access Control) e ABAC (Attribute-Based Access Control).

## ✨ Características

- 🎯 **100% Type-Safe** - Autocomplete inteligente e validação em tempo de compilação
- 🔄 **Schemas Aninhados** - Suporte para permissões hierárquicas (`order.export`)
- 🎭 **Roles & Actions** - Sistema flexível de papéis e ações
- 🔍 **Conditions** - Condições estáticas e dinâmicas com contexto
- 🚀 **Zero Config** - Funciona out-of-the-box
- 📦 **Leve** - Sem dependências externas
- 🧩 **Extensível** - Adicione seus próprios tipos de roles e actions
- ⚡ **Performance** - Sistema de cache interno para consultas rápidas

## 📦 Instalação

```bash
# npm
npm install @matir/core

# yarn
yarn add @matir/core

# pnpm
pnpm add @matir/core
```

## 🚀 Início Rápido

```typescript
import { matir } from '@matir/core';

// 1. Defina o schema de permissões
const schema = matir.defineSchema({
  order: {
    roles: ['admin', 'super_admin'],
    actions: ['create', 'read', 'update', 'delete'],
  },
  invoice: {
    roles: ['admin'],
    actions: ['read'],
  },
});

// 2. Crie a instância
const { ability, current } = matir.createSchema(schema);

// 3. Configure o usuário
current.role('admin');
current.permissions({
  order: ['read', 'create'],
  invoice: ['read'],
});

// 4. Verifique permissões
ability.can('order', 'read');      // ✅ true
ability.can('order', 'delete');    // ❌ false
ability.cannot('order', 'delete'); // ✅ true
```

## 📚 Exemplos

### 🎭 Roles Básicas

```typescript
const { ability, current } = matir.createSchema({
  post: {
    roles: ['editor', 'admin'],
    actions: ['create', 'read', 'update', 'delete'],
  },
});

// Definir role do usuário
current.role('editor');
current.permissions({ post: ['read', 'create'] });

// Verificar permissões
ability.can('post');              // ✅ true - tem a role 'editor'
ability.can('post', 'create');    // ✅ true - tem a action 'create'
ability.can('post', 'delete');    // ❌ false - não tem a action 'delete'
```

### 🔄 Schemas Aninhados

```typescript
const { ability, current } = matir.createSchema({
  order: {
    roles: ['admin'],
    actions: ['read', 'create'],
    sub: {
      export: {
        roles: ['admin', 'super_admin'],
        actions: ['create'],
      },
      report: {
        roles: ['admin'],
        actions: ['read'],
      },
    },
  },
});

current.role('admin');
current.permissions({
  order: ['read', 'create'],
  'order.export': ['create'],
  'order.report': ['read'],
});

// Acesso aos recursos aninhados usando dot notation
ability.can('order', 'read');          // ✅ true
ability.can('order.export', 'create'); // ✅ true
ability.can('order.report', 'read');   // ✅ true
```

### 🔍 Conditions Estáticas

```typescript
const { ability, current } = matir.createSchema({
  document: {
    roles: ['editor'],
    actions: ['read', 'update'],
    conditions: {
      status: 'draft',
      department: 'engineering',
    },
  },
});

current.role('editor');
current.permissions({ document: ['read', 'update'] });

// Conditions são obrigatórias quando definidas no schema
ability.can('document', 'read', { status: 'draft' });              // ✅ true
ability.can('document', 'read', { status: 'published' });          // ❌ false

// Pode passar partial conditions
ability.can('document', 'read', { department: 'engineering' });    // ✅ true
ability.can('document', 'read', { department: 'sales' });          // ❌ false
```

### 🎯 Conditions Dinâmicas

```typescript
const { ability, current } = matir.createSchema({
  profile: {
    roles: ['user'],
    actions: ['read', 'update'],
  },
});

current.role('user');
current.permissions({ profile: ['read', 'update'] });

// Conditions como função
interface Context {
  userId: number;
  ownerId: number;
}

// Função recebe contexto tipado
ability.can(
  'profile',
  'update',
  (ctx: Context) => ctx.userId === ctx.ownerId,
  { userId: 123, ownerId: 123 }
); // ✅ true

ability.can(
  'profile',
  'update',
  (ctx: Context) => ctx.userId === ctx.ownerId,
  { userId: 123, ownerId: 456 }
); // ❌ false
```

### 🎪 Múltiplas Roles

```typescript
const { ability, current } = matir.createSchema({
  settings: {
    roles: ['admin', 'moderator'],
    actions: ['read', 'update'],
  },
});

// Definir múltiplas roles
current.roles(['user', 'moderator']);
current.permissions({ settings: ['read'] });

// Precisa ter pelo menos uma das roles definidas
ability.can('settings', 'read'); // ✅ true - tem 'moderator'

// Adicionar mais roles
current.role('admin');
// Agora tem ['user', 'moderator', 'admin']
```

### 🔒 Cenário Complexo

```typescript
const { ability, current } = matir.createSchema({
  project: {
    roles: ['admin', 'member'],
    actions: ['read', 'update', 'delete'],
    conditions: {
      archived: false,
    },
    sub: {
      task: {
        roles: ['member', 'contributor'],
        actions: ['create', 'read', 'update'],
        conditions: {
          locked: false,
        },
      },
      settings: {
        roles: ['admin'],
        actions: ['update'],
      },
    },
  },
});

current.roles(['member']);
current.permissions({
  project: ['read', 'update'],
  'project.task': ['create', 'read', 'update'],
  'project.settings': ['update'],
});

// Projeto ativo
ability.can('project', 'read', { archived: false });     // ✅ true
ability.can('project', 'read', { archived: true });      // ❌ false

// Task não travada
ability.can('project.task', 'create', { locked: false }); // ✅ true
ability.can('project.task', 'create', { locked: true });  // ❌ false

// Sem permissão de admin para settings
ability.cannot('project.settings', 'update');             // ✅ true
```

## 🔧 API

### `matir.defineSchema(schema)`

Define o schema de permissões com validação de tipos.

```typescript
const schema = matir.defineSchema({
  resource: {
    roles: ['admin'],
    actions: ['create', 'read'],
    conditions: { active: true },
  },
});
```

### `matir.createSchema(schema)`

Cria uma instância com os métodos `ability` e `current`.

```typescript
const { ability, current } = matir.createSchema(schema);
```

**Retorna:**
- `ability` - Métodos para verificar permissões
- `current` - Métodos para gerenciar estado do usuário

---

### 🎯 Métodos `ability`

#### `ability.can(subject, action?, condition?, context?)`

Verifica se o usuário **tem** permissão.

```typescript
ability.can('order');                           // Verifica apenas role
ability.can('order', 'read');                   // Verifica role + action
ability.can('order', 'read', { status: 'active' }); // Com condition
ability.can('order', 'read', (ctx) => ctx.isOwner, { isOwner: true }); // Condition dinâmica
```

#### `ability.cannot(subject, action?, condition?, context?)`

Verifica se o usuário **NÃO tem** permissão.

```typescript
ability.cannot('order', 'delete');              // true se NÃO pode
ability.cannot('invoice', 'create');            // true se NÃO pode
```

---

### 👤 Métodos `current`

#### `current.role(role)`

Define uma role para o usuário atual.

```typescript
current.role('admin');
```

#### `current.roles(roles)`

Define múltiplas roles para o usuário.

```typescript
current.roles(['admin', 'moderator']);
```

#### `current.permissions(permissions)`

Define as permissões do usuário (subject → actions).

```typescript
current.permissions({
  order: ['read', 'create'],
  'order.export': ['create'],
  invoice: ['read'],
});
```

#### `current.get()`

Retorna o estado atual do usuário.

```typescript
const { roles, permissions } = current.get();
console.log(roles);       // ['admin', 'moderator']
console.log(permissions); // { order: ['read', 'create'], ... }
```

#### `current.clear()`

Limpa todas as roles e permissions do usuário.

```typescript
current.clear();
current.get(); // { roles: [], permissions: {} }
```

---

## 🎨 Tipos Personalizados

Você pode estender os tipos padrão de `Roles` e `Actions` para adicionar seus próprios valores.

### 📝 Como Estender

Crie um arquivo de declaração de tipos (ex: `src/types/matir.d.ts`):

```typescript
import '@matir/core';

declare module '@matir/core' {
  interface MatirRoleMap {
    // Adicione suas roles customizadas
    guest: 'guest';
    moderator: 'moderator';
    billing_admin: 'billing_admin';
    content_creator: 'content_creator';
  }

  interface MatirActionMap {
    // Adicione suas actions customizadas
    publish: 'publish';
    archive: 'archive';
    export: 'export';
    approve: 'approve';
  }
}
```

### ✅ Usando Tipos Customizados

```typescript
const schema = matir.defineSchema({
  post: {
    roles: ['moderator', 'content_creator'], // ✅ Autocomplete funcionando
    actions: ['publish', 'archive'],          // ✅ Tipos customizados
  },
  invoice: {
    roles: ['billing_admin'],
    actions: ['export', 'approve'],
  },
});

const { ability, current } = matir.createSchema(schema);

current.role('moderator'); // ✅ Tipo reconhecido
current.permissions({ post: ['publish', 'archive'] }); // ✅ Validado
```

---

## 🏗️ Schema Structure

```typescript
type MatirPermission = {
  name?: string;                      // Nome descritivo
  reasons?: string;                   // Razão da permissão
  roles?: MatirRole[];                // Roles necessárias
  actions?: MatirAction[];            // Actions disponíveis
  conditions?: Record<string, any>;   // Conditions estáticas
  sub?: MatirPermissions;             // Schemas aninhados
};
```

**Exemplo completo:**

```typescript
const schema = {
  order: {
    name: 'Order Management',
    reasons: 'Control order operations',
    roles: ['admin', 'manager'],
    actions: ['create', 'read', 'update', 'delete'],
    conditions: {
      status: 'active',
      department: 'sales',
    },
    sub: {
      export: {
        roles: ['admin'],
        actions: ['create'],
      },
    },
  },
};
```

---

## 💡 Comportamentos Importantes

### ✅ Verificações

1. **Subject não existe no schema** → `false`
2. **Subject requer roles** → Verifica se usuário tem pelo menos uma
3. **Action especificada** → Verifica se usuário tem essa action
4. **Conditions no schema** → Condition torna-se **obrigatória**
5. **Condition não passa** → `false`

### 🔍 Conditions

- **Estáticas**: Objeto com valores que devem bater exatamente
- **Dinâmicas**: Função que recebe contexto e retorna boolean
- **Partial**: Pode passar apenas algumas das conditions do schema
- **Obrigatórias**: Se definidas no schema, devem ser passadas

### 🎭 Roles e Actions

- **Roles**: Verificação baseada em "pelo menos uma" (OR)
- **Actions**: Verificação exata (usuário deve ter essa action)
- **Sem actions no schema**: Permite qualquer action
- **Sem roles no schema**: Permite qualquer role

---

## 🧪 Testes

```bash
# Rodar testes
pnpm test

# Modo watch
pnpm test:watch

# Com UI e coverage
pnpm test:ui
```

---

## 📄 Licença

MIT © [brainylab](https://github.com/brainylab)

---

<div align="center">

**[⬆ Voltar ao topo](#-matircore)**

Feito com ❤️ e TypeScript

</div>
