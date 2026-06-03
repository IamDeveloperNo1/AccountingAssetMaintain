import type { AssetRowInput } from "@/modules/import-job/schemas/asset-row.schema";
import type { AssetApiPayload } from "@/modules/import-job/types/import-job.types";

export function toAssetApiPayload(row: AssetRowInput): AssetApiPayload {
  return {
    assetCode: row.assetCode.trim(),
    assetName: row.assetName.trim(),
    category: row.category.trim(),
    acquisitionDate: new Date(row.acquisitionDate).toISOString(),
    cost: row.cost,
    location: row.location.trim(),
    department: row.department.trim(),
  };
}
