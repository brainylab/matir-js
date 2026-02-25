import { describe, expect, it } from "vitest";

import type { MatirSchemaDefinition } from "./defineSchema";

import { defineSchema } from "./defineSchema";

describe("defineSchema", () => {
  it("should return the schema definition as is", () => {
    const schema = defineSchema({
      roles: { admin: "admin", editor: "editor" },
      actions: { create: "create", read: "read" },
      rules: {
        order: {
          roles: ["admin"],
          actions: ["create", "read"],
        },
      },
    });

    expect(schema).toEqual({
      roles: { admin: "admin", editor: "editor" },
      actions: { create: "create", read: "read" },
      rules: {
        order: {
          roles: ["admin"],
          actions: ["create", "read"],
        },
      },
    });
  });

  it("should preserve roles definition", () => {
    const schema = defineSchema({
      roles: {
        admin: "admin",
        editor: "editor",
        viewer: "viewer",
      },
      actions: { read: "read" },
      rules: {
        post: {
          roles: ["admin", "editor"],
          actions: ["read"],
        },
      },
    });

    expect(schema.roles).toEqual({
      admin: "admin",
      editor: "editor",
      viewer: "viewer",
    });
  });

  it("should preserve actions definition", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        order: {
          roles: ["admin"],
          actions: ["create", "read", "update", "delete"],
        },
      },
    });

    expect(schema.actions).toEqual({
      create: "create",
      read: "read",
      update: "update",
      delete: "delete",
    });
  });

  it("should preserve rules with single subject", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: { read: "read" },
      rules: {
        order: {
          roles: ["admin"],
          actions: ["read"],
        },
      },
    });

    expect(schema.rules).toEqual({
      order: {
        roles: ["admin"],
        actions: ["read"],
      },
    });
  });

  it("should preserve rules with multiple subjects", () => {
    const schema = defineSchema({
      roles: { admin: "admin", editor: "editor" },
      actions: { create: "create", read: "read", update: "update" },
      rules: {
        order: {
          roles: ["admin"],
          actions: ["create", "read", "update"],
        },
        product: {
          roles: ["admin", "editor"],
          actions: ["read"],
        },
        invoice: {
          roles: ["admin"],
          actions: ["read"],
        },
      },
    });

    expect(Object.keys(schema.rules)).toEqual(["order", "product", "invoice"]);
  });

  it("should preserve optional name and reasons properties", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: { read: "read" },
      rules: {
        order: {
          name: "Order Management",
          reasons: "Manage all orders",
          roles: ["admin"],
          actions: ["read"],
        },
      },
    });

    expect(schema.rules.order.name).toBe("Order Management");
    expect(schema.rules.order.reasons).toBe("Manage all orders");
  });

  it("should preserve conditions in rules", () => {
    const schema = defineSchema({
      roles: { editor: "editor" },
      actions: { read: "read", update: "update" },
      rules: {
        document: {
          roles: ["editor"],
          actions: ["read", "update"],
          conditions: {
            status: "draft",
            department: "engineering",
          },
        },
      },
    });

    expect(schema.rules.document.conditions).toEqual({
      status: "draft",
      department: "engineering",
    });
  });

  it("should preserve nested subjects (sub)", () => {
    const schema = defineSchema({
      roles: { admin: "admin", manager: "manager" },
      actions: { create: "create", read: "read" },
      rules: {
        order: {
          roles: ["admin", "manager"],
          actions: ["read"],
          sub: {
            export: {
              roles: ["admin"],
              actions: ["create"],
            },
          },
        },
      },
    });

    expect(schema.rules.order.sub).toEqual({
      export: {
        roles: ["admin"],
        actions: ["create"],
      },
    });
  });

  it("should preserve deeply nested subjects", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: { create: "create", read: "read", update: "update" },
      rules: {
        order: {
          roles: ["admin"],
          actions: ["read"],
          sub: {
            items: {
              roles: ["admin"],
              actions: ["read", "update"],
              sub: {
                details: {
                  roles: ["admin"],
                  actions: ["read"],
                },
              },
            },
          },
        },
      },
    });

    expect(schema.rules.order.sub?.items.sub?.details).toEqual({
      roles: ["admin"],
      actions: ["read"],
    });
  });

  it("should handle empty roles array in rules", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: { read: "read" },
      rules: {
        public: {
          roles: [],
          actions: ["read"],
        },
      },
    });

    expect(schema.rules.public.roles).toEqual([]);
  });

  it("should handle empty actions array in rules", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: { read: "read" },
      rules: {
        restricted: {
          roles: ["admin"],
          actions: [],
        },
      },
    });

    expect(schema.rules.restricted.actions).toEqual([]);
  });

  it("should handle complex scenario with multiple features", () => {
    const schema = defineSchema({
      roles: {
        admin: "admin",
        member: "member",
        contributor: "contributor",
        viewer: "viewer",
      },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        project: {
          name: "Project Management",
          reasons: "Control project access",
          roles: ["admin", "member"],
          actions: ["read", "update", "delete"],
          conditions: {
            archived: false,
          },
          sub: {
            task: {
              name: "Task Management",
              roles: ["admin", "member", "contributor"],
              actions: ["create", "read", "update"],
              conditions: {
                status: "active",
              },
            },
          },
        },
        settings: {
          roles: ["admin"],
          actions: ["read", "update"],
        },
      },
    });

    expect(schema.roles).toHaveProperty("admin");
    expect(schema.roles).toHaveProperty("viewer");
    expect(schema.actions).toHaveProperty("create");
    expect(schema.actions).toHaveProperty("delete");
    expect(schema.rules.project.name).toBe("Project Management");
    expect(schema.rules.project.conditions).toHaveProperty("archived");
    expect(schema.rules.project.sub?.task.conditions).toHaveProperty("status");
  });

  it("should maintain reference integrity", () => {
    const rolesObj = { admin: "admin", editor: "editor" };
    const actionsObj = { read: "read", write: "write" };
    const rulesObj = {
      order: {
        roles: ["admin"] as const,
        actions: ["read", "write"] as const,
      },
    };

    const schema = defineSchema({
      roles: rolesObj,
      actions: actionsObj,
      // @ts-expect-error
      rules: rulesObj,
    });

    expect(schema.roles).toBe(rolesObj);
    expect(schema.actions).toBe(actionsObj);
    expect(schema.rules).toBe(rulesObj);
  });

  it("should work with const assertions", () => {
    const schema = defineSchema({
      roles: { admin: "admin", editor: "editor" } as const,
      actions: { create: "create", read: "read" } as const,
      rules: {
        order: {
          roles: ["admin", "editor"],
          actions: ["create", "read"],
        },
      },
    });

    expect(schema.roles.admin).toBe("admin");
    expect(schema.actions.create).toBe("create");
  });

  it("should handle minimal schema", () => {
    const schema = defineSchema({
      roles: { user: "user" },
      actions: { view: "view" },
      rules: {
        home: {
          roles: ["user"],
          actions: ["view"],
        },
      },
    });

    expect(schema).toEqual({
      roles: { user: "user" },
      actions: { view: "view" },
      rules: {
        home: {
          roles: ["user"],
          actions: ["view"],
        },
      },
    });
  });

  it("should handle multiple conditions types", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: { read: "read" },
      rules: {
        document: {
          roles: ["admin"],
          actions: ["read"],
          conditions: {
            status: "active",
            priority: 1,
            isPublic: true,
          },
        },
      },
    });

    expect(schema.rules.document.conditions).toEqual({
      status: "active",
      priority: 1,
      isPublic: true,
    });
  });
});
