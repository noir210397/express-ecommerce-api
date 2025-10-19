import { RequestHandler } from "express";
import { auth } from "src/config/firebase.config";
import { AppError, formatZodError } from "src/errors/api.error";
import { createProductSchema, updateProductSchema } from "src/schemas/product.schema";
import { querySchema } from "src/schemas/query.schema";
import { createProduct, deleteProduct, getProducts, getSingleProduct, updateProduct } from "src/services/product.service";
import { UserPayload } from "src/types/user";

export const getProductsHandler: RequestHandler = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]
    if (token) {
        try {
            req.user = await auth.verifyIdToken(token) as UserPayload
        } catch (error) {
            throw new AppError(403, "invalid or expired token")
        }
    }
    const { success, data, } = querySchema.safeParse(req.query)

    const query = success ? data : { page: 1 }
    const products = await getProducts(query, req.user)
    return res.json(products)
}
export const getSingleProductHandler: RequestHandler = async (req, res) => {
    const product = await getSingleProduct(req.params.id)
    return res.json(product)
}
export const createProductHandler: RequestHandler = async (req, res) => {
    const { success, data, error } = createProductSchema.safeParse(req.body)
    let errors: Record<string, string> = {}
    if (!req.areFilesValid || !req.files || req.files.length === 0) {
        errors["images"] = "At least 1 and at most 10 images are required. Allowed types: image/jpeg, image/jpg, image/png."
    }
    if (!success) {
        errors = { ...formatZodError(error), ...errors }
    }
    else {
        if (Object.keys(errors).length > 0) {
            throw new AppError(400, undefined, errors)
        }
        const files = req.files as Express.Multer.File[]
        const buffers = files.map(file => file.buffer)
        await createProduct({ ...data, images: buffers })
        return res.sendStatus(201)
    }
}
export const updateProductHandler: RequestHandler = async (req, res) => {
    const { success, data, error } = updateProductSchema.safeParse(req.body || {})
    let errors: Record<string, string> = {}
    if (!req.areFilesValid) {
        errors["images"] = "At least 1 and at most 10 images are required. Allowed types: image/jpeg, image/jpg, image/png."
    }
    if (!success) {
        errors = { ...formatZodError(error), ...errors }
        throw new AppError(400, undefined, errors)
    }
    else {
        if (Object.keys(errors).length > 0) {
            throw new AppError(400, undefined, errors)
        }
        const files = !req.files ? [] : req.files as Express.Multer.File[]
        const buffers = files.map(file => file.buffer)
        await updateProduct({ ...data, images: buffers }, req.params.id)
        return res.sendStatus(204)
    }
}
export const deleteProductHandler: RequestHandler = async (req, res) => {
    await deleteProduct(req.params.id)
    return res.sendStatus(204)
}
