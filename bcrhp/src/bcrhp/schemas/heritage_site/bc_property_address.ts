import { z } from 'zod';

// Auto-generated tile schema for alias: bc_property_address

const StreetAddressNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const PostalCodeNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const LocationDescriptionNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const CityNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ProvinceNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const LocalityNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const BcPropertyAddressTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        street_address: StreetAddressNodeSchema,
        postal_code: PostalCodeNodeSchema,
        location_description: LocationDescriptionNodeSchema,
        city: CityNodeSchema,
        province: ProvinceNodeSchema,
        locality: LocalityNodeSchema,
        bc_property_legal_description: z.array(BcPropertyLegalDescriptionTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type BcPropertyAddressTileType = z.infer<typeof BcPropertyAddressTileSchema>;