import z from "zod"
export const createProductSchema = z.object({
    name: z.string("product name is required").trim().min(2).toLowerCase(),
    price: z.coerce.number("price is required").positive("price must be a valid positive number").transform(val => {
        return Math.round(val * 100) / 100
    }),
    quantity: z.coerce.number("quantity is required").int("quantity must be a positive integer").positive("quantity must be a positive integer"),
    description: z.string("description is required").trim().min(50, "description must have at least 50 characters").toLowerCase(),
    categories: z.string("category is required").trim().toLowerCase().transform(val => val.split(",")),
})

export type CreateProductRequest = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.extend({
    deletedImages: z.string().trim().transform(val => val.split(",")).optional().default([])
}).partial()

export type UpdateProductRequest = z.infer<typeof updateProductSchema>