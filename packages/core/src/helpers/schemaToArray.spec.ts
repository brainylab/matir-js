import { describe, expect, it } from "vitest";

import { defineSchema } from "./defineSchema";
import { schemaToArray } from "./schemaToArray";

describe("schemaToArray", () => {
  it("should convert schema to array with id property", () => {
    const schema = defineSchema({
      roles: { admin: "admin", super_admin: "super_admin" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        order: {
          roles: ["admin"],
          actions: ["create", "read"],
        },
        config: {
          roles: ["admin", "super_admin"],
          actions: ["update"],
        },
      },
    });

    const result = schemaToArray(schema);

    expect(result.rules).toEqual([
      {
        id: "order",
        roles: ["admin"],
        actions: ["create", "read"],
      },
      {
        id: "config",
        roles: ["admin", "super_admin"],
        actions: ["update"],
      },
    ]);

    expect(result.rules.length).toBe(2);
    expect(result.rules[0].id).toBe("order");
    expect(result.rules[1].id).toBe("config");
  });

  it("should handle schema with conditions", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
      rules: {
        document: {
          roles: ["admin"],
          actions: ["read", "update"],
          conditions: {
            status: "draft",
          },
        },
      },
    });

    const result = schemaToArray(schema);

    expect(result.rules).toEqual([
      {
        id: "document",
        roles: ["admin"],
        actions: ["read", "update"],
        conditions: {
          status: "draft",
        },
      },
    ]);
  });

  it("should handle schema with sub without recursive", () => {
    const schema = defineSchema({
      roles: { admin: "admin" },
      actions: {
        create: "create",
      },
      rules: {
        order: {
          roles: ["admin"],
          sub: {
            export: {
              roles: ["admin"],
              actions: ["create"],
            },
          },
        },
      },
    });

    const result = schemaToArray(schema);

    expect(result.rules).toEqual([
      {
        id: "order",
        roles: ["admin"],
        sub: [
          {
            id: "export",
            roles: ["admin"],
            actions: ["create"],
          },
        ],
      },
    ]);
  });
});
