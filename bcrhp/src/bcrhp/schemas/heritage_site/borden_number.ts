import { z } from 'zod';

// Auto-generated tile schema for alias: borden_number

export const BordenNumberTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        borden_number: z.array(BordenNumberTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type BordenNumberTileType = z.infer<typeof BordenNumberTileSchema>;
