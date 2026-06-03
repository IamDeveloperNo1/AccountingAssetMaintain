export const ASSET_IMPORT_HEADERS = [
  "assetCode",
  "assetName",
  "category",
  "acquisitionDate",
  "cost",
  "location",
  "department",
] as const;

export type AssetImportHeader = (typeof ASSET_IMPORT_HEADERS)[number];
