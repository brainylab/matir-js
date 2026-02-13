/dev/null/README-EXTENSION.md
# Estendendo Tipos do Matir

A biblioteca Matir permite que você estenda os tipos de `Roles` e `Actions` no seu projeto.

## Como Estender

Crie um arquivo de declaração de tipos no seu projeto (por exemplo: `src/types/matir.d.ts`):

```typescript
import "@matir/core";

declare module "@matir/core" {
	interface MartirRoleMap {
		// Suas roles customizadas
		guest: "guest";
		moderator: "moderator";
		billing_admin: "billing_admin";
	}

	interface MartirActionMap {
		// Suas actions customizadas
		publish: "publish";
		archive: "archive";
		export: "export";
	}
}

import { MatirCore } from "@matir/core";

const permissions = {
	post: {
		roles: ["moderator"], // ✅ Tipo customizado
		actions: ["publish", "archive"], // ✅ Actions customizadas
	},
	invoice: {
		roles: ["billing_admin"], // ✅ Nova role
		actions: ["export"], // ✅ Nova action
	},
};

const matir = new MatirCore(permissions);

// Autocomplete vai mostrar tanto os tipos padrão quanto os customizados
matir.can("post", {
	roles: ["moderator"],
	actions: ["publish"],
});
