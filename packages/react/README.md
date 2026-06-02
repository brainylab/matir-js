# @matir-js/react

Integração React para o [matir](https://github.com/brainylab/matir) — controle de acesso baseado em roles e permissões, com tipagem completa via TypeScript.

## Instalação

```bash
pnpm add @matir-js/react @matir-js/core
```

---

## Setup

### 1. Defina o schema

```ts
// lib/matir.ts
import { defineSchema } from "@matir-js/core"

export const matirSchema = defineSchema({
  roles: {
    admin: "Administrador",
    editor: "Editor",
    viewer: "Visualizador",
  },
  actions: {
    create: "Criar",
    read:   "Visualizar",
    update: "Editar",
    delete: "Excluir",
  },
  rules: {
    product: {
      roles:   ["admin", "editor"],
      actions: ["create", "read", "update"],
      sub: {
        export: {
          roles:   ["admin"],
          actions: ["create"],
        },
      },
    },
    order: {
      roles:   ["admin", "editor", "viewer"],
      actions: ["read"],
    },
    settings: {
      roles:   ["admin"],
      actions: ["read", "update"],
    },
  },
})
```

### 2. Registre os types globalmente

```ts
// types/matir.d.ts
import type { matirSchema } from "@/lib/matir"

declare module "@matir-js/react" {
  interface MatirRegister {
    schema: typeof matirSchema
  }
}
```

A partir daqui, todos os helpers e hooks passam a ser tipados com os roles, subjects e actions do seu schema.

### 3. Configure o Provider

```tsx
// app/layout.tsx
import { MatirProvider } from "@matir-js/react"
import { matirSchema } from "@/lib/matir"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <MatirProvider schema={matirSchema}>
      {children}
    </MatirProvider>
  )
}
```

#### Com role e permissões iniciais (SSR / sessão do servidor)

```tsx
<MatirProvider
  schema={matirSchema}
  current={{
    role: "admin",
    permissions: {
      product:          ["create", "read", "update"],
      "product.export": ["create"],
      order:            ["read"],
    },
  }}
>
  {children}
</MatirProvider>
```

---

## Hooks

### `useCurrent`

Lê e define a role e permissões do usuário atual.

```ts
const {
  role,           // { value: string | null, description: string | null } | null
  permissions,    // { [subject]: action[] } | null
  setRole,        // (role: string) => void
  setPermissions, // (permissions: Record<string, string[]>) => void
  getPermission,  // (subject) => action[] | null
  getPermissions, // (pattern: "subject.*") => { key, actions }[]
  clearAll,       // () => void
} = useCurrent()
```

**Exemplo — definir usuário após login:**

```ts
const { setRole, setPermissions } = useCurrent()

async function handleLogin(credentials) {
  const user = await login(credentials)

  setRole(user.role)
  setPermissions(user.permissions)
}
```

**Exemplo — ler permissões de um subject:**

```ts
const { getPermission, getPermissions } = useCurrent()

// subject específico
const productActions = getPermission("product")
// → ["create", "read", "update"] | null

// wildcard — todos os subjects que começam com "product."
const productAll = getPermissions("product.*")
// → [{ key: "product.export", actions: ["create"] }]
```

---

### `useAbility`

Retorna o objeto `ability` para verificações imperativas baseadas no schema.

```ts
const ability = useAbility()

ability.can("product", "create")     // → boolean
ability.cannot("settings", "update") // → boolean
```

**Com condition objeto:**

```ts
ability.can("product", "read", { status: "active" })
```

**Com condition função:**

```ts
ability.can("product", "update", (ctx: { ownerId: string }) => {
  return ctx.ownerId === currentUser.id
}, { ownerId: "123" })
```

---

## Componente `<Can>`

Renderiza filhos condicionalmente baseado em permissão.

```tsx
import { Can } from "@matir-js/react"

// Renderiza se tiver permissão
<Can subject="product" actions="create">
  <button>Novo produto</button>
</Can>

// Com fallback
<Can subject="settings" actions="update" fallback={<p>Sem acesso</p>}>
  <SettingsForm />
</Can>

// passThrough — passa o resultado como render prop
<Can subject="product" actions="delete" passThrough>
  {(allowed) => (
    <button disabled={!allowed}>Excluir</button>
  )}
</Can>
```

---

## Navegação

### `defineNav`

Define a estrutura de navegação tipada com o schema. O campo `permissions` é opcional por item.

```ts
import { defineNav } from "@matir-js/react"

type NavItem =
  | { type: "title"; title: string }
  | { type: "link";  title: string; path: string; alias?: string }
  | { type: "collapsible"; title: string }

export const navGroups = defineNav<NavItem>([
  {
    type:  "title",
    title: "Geral",
    items: [
      {
        // sem permissions → sempre visível
        type:  "link",
        title: "Dashboard",
        path:  "/dashboard",
      },
    ],
  },
  {
    type:  "title",
    title: "Vendas",
    items: [
      {
        type:        "link",
        title:       "Orçamentos",
        path:        "/sales/budgets",
        permissions: { "sales.budget": "view" }, // visível só se tiver permissão
      },
    ],
  },
  {
    type:  "title",
    title: "Catálogo",
    items: [
      {
        type:        "collapsible",
        title:       "Produtos",
        permissions: { product: "read" },
        items: [
          {
            type:        "link",
            title:       "Exportar",
            path:        "/products/export",
            permissions: { "product.export": "create" },
          },
        ],
      },
    ],
  },
])
```

**Comportamento do `permissions`:**

| Situação | Resultado |
|---|---|
| `permissions` ausente ou vazio | Sempre visível |
| `permissions` preenchido + usuário tem a permissão | Visível |
| `permissions` preenchido + usuário não tem a permissão | Oculto |

O TypeScript autocompleta os subjects (`"product"`, `"product.export"`, `"sales.budget"`, ...) e as actions disponíveis para cada um a partir do schema registrado.

---

### `defineCanNav`

Função pura que filtra o array do `defineNav` pelas permissões do usuário. Útil quando você já tem o objeto `permissions` em mãos (ex: SSR).

```ts
import { defineCanNav } from "@matir-js/react"
import { navGroups } from "@/config/nav"

const filtered = defineCanNav(navGroups, user.permissions)
```

A filtragem é **recursiva** — `items` aninhados também são filtrados. O pai é mantido mesmo que todos os filhos sejam removidos.

---

### `useCanNav`

Hook que combina `defineCanNav` com `useCurrent` e `useMemo`. Use quando precisar filtrar a nav de forma reativa no cliente.

```tsx
import { useCanNav } from "@matir-js/react"
import { navGroups } from "@/config/nav"

function Sidebar() {
  const nav = useCanNav(navGroups)

  return (
    <nav>
      {nav.map((item) => (
        <NavItem key={item.title} item={item} />
      ))}
    </nav>
  )
}
```

Recalcula automaticamente sempre que as permissões do usuário mudam. Não causa re-renders desnecessários por usar `useMemo` internamente.

---

## Tipos utilitários

### `InferPermissions`

Infere o tipo de permissões a partir do schema, útil para tipar objetos vindos do backend.

```ts
import type { InferPermissions } from "@matir-js/core"
import type { matirSchema } from "@/lib/matir"

type UserPermissions = InferPermissions<typeof matirSchema>
// → {
//     product?:          ("create" | "read" | "update")[]
//     "product.export"?: ("create")[]
//     order?:            ("read")[]
//     settings?:         ("read" | "update")[]
//   }
```

---

## Referência da API

| Export | Tipo | Descrição |
|---|---|---|
| `MatirProvider` | Component | Provider que inicializa o matir com o schema |
| `useCurrent` | Hook | Lê/define role e permissões do usuário atual |
| `useAbility` | Hook | Retorna `ability.can` e `ability.cannot` baseado no schema |
| `Can` | Component | Renderização condicional por permissão |
| `defineNav` | Helper | Define estrutura de navegação tipada pelo schema |
| `defineCanNav` | Helper | Função pura que filtra nav pelas permissões do usuário |
| `useCanNav` | Hook | Filtra nav reativamente usando `useCurrent` + `useMemo` |
| `MatirRegister` | Interface | Augmentation para registrar o schema globalmente |
`
