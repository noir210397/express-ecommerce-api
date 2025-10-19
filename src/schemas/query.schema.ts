import z from "zod"

export const querySchema = z.object({
    page: z.coerce.number().int().positive("positive valid number is required if provided").optional().default(1),
    query: z.string().optional(),
    pageSize: z.coerce.number().int().positive("positive valid number is required if provided").optional()
})

export type QueryType = z.infer<typeof querySchema>