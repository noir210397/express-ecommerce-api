import { CreateProductRequest } from "src/schemas/product.schema"

export type Product = CreateProductRequest & {
    images: string[]
    id: string
}