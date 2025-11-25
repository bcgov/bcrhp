import { z } from 'zod';

// Auto-generated tile schema for alias: site_images

const ImageTypeNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ImageDateNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ImageFeaturesNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ImageDescriptionNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const PrimaryImageNodeSchema = z.object({
    node_value: z.boolean().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ImageViewNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const PhotographerNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const SubmitToCrhpNodeSchema = z.object({
    node_value: z.boolean().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const CopyrightNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const SiteImagesTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        image_type: ImageTypeNodeSchema,
        site_images: z.array(SiteImagesTileSchema),
        image_date: ImageDateNodeSchema,
        image_features: ImageFeaturesNodeSchema,
        image_description: ImageDescriptionNodeSchema,
        primary_image: PrimaryImageNodeSchema,
        image_view: ImageViewNodeSchema,
        photographer: PhotographerNodeSchema,
        submit_to_crhp: SubmitToCrhpNodeSchema,
        copyright: CopyrightNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type SiteImagesTileType = z.infer<typeof SiteImagesTileSchema>;