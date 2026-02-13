import { MatirCore } from "./src/core";
import type { MartirPermissions } from "./src/types";

const permissions = {
	order: {
		roles: ["admin", "manager"],
		actions: ["create", "read", "update"],
		conditions: { isActive: true },
	},
} satisfies MartirPermissions;

const matir = MatirCore.create(permissions);

// ✅ APROVADO - tem a role
console.log(
	matir.can("order", { roles: ["admin"], condition: { isActive: () => true } }),
); // true

// ❌ NEGADO - não tem a role
matir.can("order", { roles: ["viewer"] }); // false

// ✅ APROVADO - tem a action
matir.can("order", { actions: ["create"] }); // true

// ❌ NEGADO - não tem a action
matir.can("order", { actions: ["delete"] }); // false

// ✅ APROVADO - todas as conditions batem
matir.can("order", {
	roles: ["admin"],
	actions: ["create"],
	condition: { isActive: true },
}); // true

// ❌ NEGADO - condition não bate
matir.can("order", {
	roles: ["admin"],
	condition: { isActive: false },
}); // false
