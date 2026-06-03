import { z } from "zod";

export const assetRowSchema = z.object({
  assetCode: z.string().min(1, "assetCode is required"),
  assetName: z.string().min(1, "assetName is required"),
  category: z.string().min(1, "category is required"),
  acquisitionDate: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "acquisitionDate must be a valid date",
    }),
  cost: z.coerce.number().nonnegative("cost must be zero or positive"),
  location: z.string().min(1, "location is required"),
  department: z.string().min(1, "department is required"),
});

export type AssetRowInput = z.infer<typeof assetRowSchema>;
