import { matir } from "@matir-js/core";

import { buildState } from "./src/hooks/useManipulation";

const matirSchema = matir.defineSchema({
  roles: {
    administrator: "Administrador",
    financial: "Financeiro",
    biller: "Faturador",
    seller: "Vendedor",
    seller_office: "Escritório do Vendedor",
    editor: "Editor",
    no_role: "Sem Função",
  },
  actions: {
    view: "Visualizar",
    create: "Criar",
    edit: "Editar",
    delete: "Deletar",
    approve: "Aprovar",
  },
  rules: {
    dashboard: {
      name: "Dashboards",
      description:
        "Gerenciar permissões de acesso ao Dashboard de cada função.",
      sub: {
        general: {
          name: "Geral",
          actions: ["view"],
        },
        sales: {
          name: "Vendas",
          actions: ["view"],
        },
        security: {
          name: "Segurança",
          actions: ["view"],
        },
        registers: {
          name: "Cadastros",
          actions: ["view"],
        },
        cms: {
          name: "CMS",
          actions: ["view"],
        },
      },
    },
    sales: {
      name: "Vendas",
      description: "Gerenciar permissões de acesso ao módulo de vendas.",
      roles: [
        "administrator",
        "biller",
        "financial",
        "seller",
        "seller_office",
      ],
      sub: {
        budget: {
          name: "Orçamento",
          actions: ["view", "create", "edit", "delete", "approve"],
          conditions: {
            isCreator: true,
          },
        },
        "order:admin": {
          name: "Pedidos Admin",
          actions: ["view"],
        },
        clients: {
          name: "Clientes",
          actions: ["view"],
        },
        products: {
          name: "Produtos",
          actions: ["view"],
        },
      },
    },
    registers: {
      name: "Cadastros",
      description: "Gerenciar permissões de acesso ao módulo de cadastros.",
      sub: {
        products: {
          name: "Produtos",
          actions: ["view", "create", "edit"],
          sub: {
            catalog: {
              name: "Catalogo de Produtos",
              actions: ["view", "create", "edit"],
            },
          },
        },
        shipping_companies: {
          name: "Transportadoras",
          actions: ["view", "create", "edit"],
        },
      },
    },
    system: {
      name: "Sistema",
      description:
        "Gerenciar permissões de acesso as configurações do sistema.",
      actions: ["view"],
      sub: {
        configuration: {
          name: "Configurações",
          actions: ["view"],
          sub: {
            user: {
              name: "Configurações Usuários",
              actions: ["view", "create", "edit"],
            },
          },
        },
      },
    },
  },
});

const list = matir.schemaToArray(matirSchema).rules;

// console.log(list[3]);
console.log(
  buildState(list, { "system.configuration.user": ["view"] })[3].sub[0].sub[0],
);
