import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assetRowSchema } from "@/modules/import-job/schemas/asset-row.schema";

describe("assetRowSchema", () => {
  it("accepts a valid asset row", () => {
    const parsed = assetRowSchema.parse({
      assetCode: "AST-001",
      assetName: "Laptop",
      category: "IT",
      acquisitionDate: "2024-05-01",
      cost: "15000",
      location: "HQ",
      department: "IT",
    });

    assert.equal(parsed.cost, 15000);
  });

  it("rejects invalid cost", () => {
    assert.throws(() =>
      assetRowSchema.parse({
        assetCode: "AST-002",
        assetName: "Chair",
        category: "Furniture",
        acquisitionDate: "2024-05-01",
        cost: -1,
        location: "HQ",
        department: "HR",
      }),
    );
  });
});
