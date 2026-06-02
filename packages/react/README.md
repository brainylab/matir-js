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

Retorna o objeto `ability` para verificações imperativas.

```ts
const ability = useAbility()

ability.can("product", "create")   // → boolean
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

Define a estrutura de navegação tipada com o schema. O campo `permissions` é opcional — itens sem ele são sempre visíveis.

```ts
import { defineNav } from "@matir-js/react"

type NavItem =
  | { type: "title"; label: string }
  | { type: "link";  label: string; href: string }
  | { type: "group"; label: string }

export const navGroups = defineNav<NavItem>([
  {
    type:  "title",
    label: "Geral",
  },
  {
    type:        "link",
    label:       "Dashboard",
    href:        "/dashboard",
    permissions: { order: "read" },
  },
  {
    type:        "group",
    label:       "Catálogo",
    permissions: { product: "read" },
    items: [
      {
        type:        "link",
        label:       "Produtos",
        href:        "/products",
        permissions: { product: "read" },
      },
      {
        type:        "link",
        label:       "Exportar",
        href:        "/products/export",
        permissions: { "product.export": "create" },
      },
    ],
  },
])
```

O TypeScript vai autocompletar os subjects (`"product"`, `"product.export"`, `"order"`, ...) e as actions disponíveis para cada um.

---

### `defineCanNav`

Filtra o array retornado pelo `defineNav`, mantendo apenas os itens que o usuário tem permissão. A filtragem é **recursiva** — items aninhados também são filtrados.

**Regras:**
- Sem `permissions` → sempre visível
- Com `permissions` → pelo menos **uma** entrada deve passar no `can` (lógica OR)
- O pai é mantido mesmo que todos os filhos sejam removidos

```ts
import { useAbility, defineCanNav } from "@matir-js/react"
import { useMemo } from "react"
import { navGroups } from "@/config/nav"

function Sidebar() {
  const ability = useAbility()

  const nav = useMemo(
    () => defineCanNav(navGroups, ability),
    [ability],
  )

  return (
    <nav>
      {nav.map((item) => (
        <NavItem key={item.label} item={item} />
      ))}
    </nav>
  )
}
```

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
| `useAbility` | Hook | Retorna `ability.can` e `ability.cannot` |
| `Can` | Component | Renderização condicional por permissão |
| `defineNav` | Helper | Define estrutura de navegação tipada |
| `defineCanNav` | Helper | Filtra nav pelo que o usuário tem acesso |
| `MatirRegister` | Interface | Augmentation para registrar o schema globalmente |
`
