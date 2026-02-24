import { describe, expect, it } from "vitest";

import { defineSchema, schemaToArray } from "./helper";

describe("schemaToArray", () => {
  it("should convert schema to array with id property", () => {
    const schema = defineSchema({
      order: {
        roles: ["admin"],
        actions: ["create", "read"],
      },
      config: {
        roles: ["admin", "super_admin"],
        actions: ["update"],
      },
    });

    const result = schemaToArray(schema);

    expect(result).toEqual([
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

    expect(result.length).toBe(2);
    expect(result[0].id).toBe("order");
    expect(result[1].id).toBe("config");
  });

  it("should handle schema with conditions", () => {
    const schema = defineSchema({
      document: {
        roles: ["admin"],
        actions: ["read", "update"],
        conditions: {
          status: "draft",
        },
      },
    });

    const result = schemaToArray(schema);

    expect(result).toEqual([
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
      order: {
        roles: ["admin"],
        sub: {
          export: {
            roles: ["admin"],
            actions: ["create"],
          },
        },
      },
    });

    const result = schemaToArray(schema);

    expect(result).toEqual([
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
