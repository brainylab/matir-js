import type { MatirCurrentPermissions } from "../types";

export function diffPermissions(
  current: MatirCurrentPermissions,
  values: MatirCurrentPermissions,
) {
  // Itera sobre todas as keys de values (usando keys como base)
  for (const key in values) {
    const valueActions = values[key];

    // Se values[key] é um array vazio, remove a key de current
    if (valueActions.length === 0) {
      delete current[key];
      continue;
    }

    // Se a key não existe em current, adiciona com os valores de values
    if (!current[key]) {
      current[key] = [...valueActions];
      continue;
    }

    const currentActions = current[key];

    // Remove actions que estão em current mas não em values
    for (let i = currentActions.length - 1; i >= 0; i--) {
      if (!valueActions.includes(currentActions[i])) {
        currentActions.splice(i, 1);
      }
    }

    // Adiciona actions que estão em values mas não em current
    for (const action of valueActions) {
      if (!currentActions.includes(action)) {
        currentActions.push(action);
      }
    }
  }

  return current;
}
