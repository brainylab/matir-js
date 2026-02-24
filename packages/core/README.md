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
[Conversão de Schema](#-conversão-de-schema)

</div>

---

## 📋 Sobre

**@matir/core** é uma biblioteca TypeScript poderosa e type-safe para gerenciar permissões e controle de acesso em suas aplicações. Com suporte completo a roles, actions, conditions e schemas aninhados, oferece uma solução flexível e intuitiva para RBAC (Role-Based Access Control) e ABAC (Attribute-Based Access Control).

## ✨ Características

- 🎯 **100% Type-Safe** - Autocomplete inteligente e validação em tempo de compilação
- 🔄 **Schemas Aninhados** - Suporte para permissões hierárquicas (`order.export`)
- 🎭 **Roles & Actions Dinâmicos** - Defina seus próprios roles e actions no schema
- 🔍 **Conditions** - Condições estáticas e dinâmicas com contexto
- 🚀 **Zero Config** - Funciona out-of-the-box
- 📦 **Leve** - Sem dependências externas
- 🧩 **Extensível** - Roles e actions são inferidos do schema
- ⚡ **Performance** - Sistema de cache interno para consultas rápidas
- 🔄 **Conversão de Schema** - Converta schemas para array para APIs/Database

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

// 1. Defina o schema de permissões com roles, actions e rules
const schema = matir.defineSchema({
  roles: ['admin', 'editor', 'viewer'] as const,
  actions: ['create', 'read', 'update', 'delete'] as const,
  rules: {
    order: {
      roles: ['admin', 'editor'],
      actions: ['create', 'read', 'update', 'delete'],
    },
    invoice: {
      roles: ['admin'],
      actions: ['read'],
    },
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

### 🎭 Roles e Actions Básicas

```typescript
const schema = matir.defineSchema({
  roles: ['editor', 'admin', 'viewer'] as const,
  actions: ['create', 'read', 'update', 'delete', 'publish'] as const,
  rules: {
    post: {
      roles: ['editor', 'admin'],
      actions: ['create', 'read', 'update', 'delete', 'publish'],
    },
    comment: {
      roles: ['viewer', 'editor', 'admin'],
      actions: ['read', 'create'],
    },
  },
});

const { ability, current } = matir.createSchema(schema);

// Definir role do usuário
current.role('editor');
current.permissions({ 
  post: ['read', 'create', 'update'],
  comment: ['read', 'create'],
});

// Verificar permissões
ability.can('post');              // ✅ true - tem a role 'editor'
ability.can('post', 'create');    // ✅ true - tem a action 'create'
ability.can('post', 'delete');    // ❌ false - não tem a action 'delete'
ability.can('comment', 'read');   // ✅ true - tem a action 'read'
```

### 🔄 Schemas Aninhados

```typescript
const schema = matir.defineSchema({
  roles: ['admin', 'super_admin', 'manager'] as const,
  actions: ['create', 'read', 'update', 'delete'] as const,
  rules: {
    order: {
      roles: ['admin', 'manager'],
      actions: ['read', 'create', 'update'],
      sub: {
        export: {
          roles: ['admin', 'super_admin'],
          actions: ['create'],
        },
        report: {
          roles: ['admin', 'manager'],
          actions: ['read'],
        },
      },
    },
  },
});

const { ability, current } = matir.createSchema(schema);

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
const schema = matir.defineSchema({
  roles: ['editor', 'admin'] as const,
  actions: ['read', 'update', 'delete'] as const,
  rules: {
    document: {
      roles: ['editor'],
      actions: ['read', 'update'],
      conditions: {
        status: 'draft',
        department: 'engineering',
      },
    },
  },
});

const { ability, current } = matir.createSchema(schema);

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
const schema = matir.defineSchema({
  roles: ['user', 'admin'] as const,
  actions: ['read', 'update', 'delete'] as const,
  rules: {
    profile: {
      roles: ['user'],
      actions: ['read', 'update'],
    },
  },
});

const { ability, current } = matir.createSchema(schema);

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
const schema = matir.defineSchema({
  roles: ['user', 'admin', 'moderator', 'super_admin'] as const,
  actions: ['read', 'update', 'delete'] as const,
  rules: {
    settings: {
      roles: ['admin', 'moderator'],
      actions: ['read', 'update'],
    },
  },
});

const { ability, current } = matir.createSchema(schema);

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
const schema = matir.defineSchema({
  roles: ['admin', 'member', 'contributor', 'viewer'] as const,
  actions: ['create', 'read', 'update', 'delete'] as const,
  rules: {
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
  },
});

const { ability, current } = matir.createSchema(schema);

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

Define o schema de permissões com validação de tipos. O schema deve conter:
- `roles`: Array de strings com as roles disponíveis
- `actions`: Array de strings com as actions disponíveis
- `rules`: Objeto com as regras de permissão

```typescript
const schema = matir.defineSchema({
  roles: ['admin', 'editor', 'viewer'] as const,
  actions: ['create', 'read', 'update', 'delete'] as const,
  rules: {
    resource: {
      roles: ['admin'],
      actions: ['create', 'read'],
      conditions: { active: true },
    },
  },
});
```

**⚠️ Importante**: Use `as const` para garantir inferência de tipos literal!

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

Define uma role para o usuário atual. A role deve estar definida no array `roles` do schema.

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

## 🔄 Conversão de Schema

A função `schemaToArray` converte o schema em um formato array, útil para serialização, APIs REST ou armazenamento em database.

### `matir.schemaToArray(schema)`

```typescript
import { matir } from '@matir/core';

const schema = matir.defineSchema({
  roles: ['admin', 'editor'] as const,
  actions: ['create', 'read', 'update'] as const,
  rules: {
    order: {
      roles: ['admin'],
      actions: ['create', 'read'],
    },
    config: {
      roles: ['admin', 'editor'],
      actions: ['update'],
      sub: {
        export: {
          roles: ['admin'],
          actions: ['create'],
        },
      },
    },
  },
});

const arraySchema = matir.schemaToArray(schema);
```

**Resultado:**

```typescript
{
  roles: ['admin', 'editor'],
  actions: ['create', 'read', 'update'],
  rules: [
    {
      id: 'order',
      roles: ['admin'],
      actions: ['create', 'read'],
    },
    {
      id: 'config',
      roles: ['admin', 'editor'],
      actions: ['update'],
      sub: [
        {
          id: 'export',
          roles: ['admin'],
          actions: ['create'],
        },
      ],
    },
  ],
}
```

### 📤 Exemplo de Uso com API

```typescript
// Enviar para API
const response = await fetch('/api/permissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(matir.schemaToArray(schema)),
});

// Salvar no localStorage
localStorage.setItem('permissions', JSON.stringify(matir.schemaToArray(schema)));

// Enviar para database
await db.permissions.create({
  data: matir.schemaToArray(schema),
});
```

---

## 🏗️ Schema Structure

### Formato de Entrada (defineSchema)

```typescript
type SchemaDefinition = {
  roles: readonly string[];        // Array de roles disponíveis
  actions: readonly string[];      // Array de actions disponíveis
  rules: MatirPermissions;         // Regras de permissão
};

type MatirPermission = {
  name?: string;                   // Nome descritivo
  reasons?: string;                // Razão da permissão
  roles?: Role[];                  // Roles necessárias (do array roles)
  actions?: Action[];              // Actions disponíveis (do array actions)
  conditions?: Record<string, any>; // Conditions estáticas
  sub?: MatirPermissions;          // Schemas aninhados
};
```

### Formato de Saída (schemaToArray)

```typescript
type SchemaArrayResult = {
  roles: readonly string[];        // Array de roles
  actions: readonly string[];      // Array de actions
  rules: SchemaArrayItem[];        // Regras em formato array
};

type SchemaArrayItem = {
  id: string;                      // Identificador do resource
  name?: string;
  reasons?: string;
  roles?: string[];
  actions?: string[];
  conditions?: Record<string, any>;
  sub?: SchemaArrayItem[];         // Sub-resources recursivos
};
```

**Exemplo completo:**

```typescript
const schema = matir.defineSchema({
  roles: ['admin', 'manager', 'viewer'] as const,
  actions: ['create', 'read', 'update', 'delete'] as const,
  rules: {
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
          name: 'Order Export',
          roles: ['admin'],
          actions: ['create'],
        },
      },
    },
  },
});

// Converter para array
const arraySchema = matir.schemaToArray(schema);
// {
//   roles: ['admin', 'manager', 'viewer'],
//   actions: ['create', 'read', 'update', 'delete'],
//   rules: [{ id: 'order', name: 'Order Management', ... }]
// }
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
- **Type-Safe**: Roles e actions são inferidos do array definido no schema

### 🔄 Schema Aninhado (sub)

- Use **dot notation** para acessar: `'order.export'`
- Herda contexto do parent mas tem suas próprias rules
- Pode ter roles e actions diferentes do parent
- Conversão para array mantém hierarquia

---

## 🎯 Inferência de Tipos

O sistema infere automaticamente os tipos a partir do schema:

```typescript
const schema = matir.defineSchema({
  roles: ['admin', 'editor', 'viewer'] as const,
  actions: ['create', 'read', 'update', 'delete'] as const,
  rules: {
    post: {
      roles: ['admin', 'editor'], // ✅ Autocomplete: 'admin' | 'editor' | 'viewer'
      actions: ['create', 'read'], // ✅ Autocomplete: 'create' | 'read' | 'update' | 'delete'
    },
  },
});

const { ability, current } = matir.createSchema(schema);

// ✅ TypeScript sabe quais roles existem
current.role('admin');    // OK
current.role('invalid');  // ❌ Erro de compilação

// ✅ TypeScript sabe quais subjects existem
ability.can('post');      // OK
ability.can('invalid');   // ❌ Erro de compilação

// ✅ TypeScript sabe quais actions existem para cada subject
ability.can('post', 'read');    // OK
ability.can('post', 'invalid'); // ❌ Erro de compilação
```

**💡 Dica**: Sempre use `as const` nos arrays para garantir tipos literais!

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