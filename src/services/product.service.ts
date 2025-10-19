import { Filter } from "firebase-admin/firestore";
import { uploadImagesToCloudinary } from "src/config/cloudinary.config";
import { db } from "src/config/firebase.config";
import { MAX_PAGE_SIZE } from "src/constants/constants";
import { AppError } from "src/errors/api.error";
import { CreateProductRequest, UpdateProductRequest } from "src/schemas/product.schema";
import { QueryType } from "src/schemas/query.schema";
import { UserPayload } from "src/types/user";

const productsRef = db.collection("products")
export async function createProduct(productToCreate: CreateProductRequest & { images: Buffer[] }) {
    const { images, ...rest } = productToCreate
    try {
        const uploadedImages = await uploadImagesToCloudinary(images)
        await productsRef.add({ ...rest, images: uploadedImages })
    } catch (error) {
        throw new AppError(500, "unable to create product due to server error")
    }
}

export async function updateProduct(productToUpdate: Partial<UpdateProductRequest & { images: Buffer[] }>, id: string) {
    const productRef = productsRef.doc(id)
    const { images, deletedImages, ...rest } = productToUpdate
    let uploadedImages: string[] = []
    try {
        if (images && images.length) {
            const imagesUrl = await uploadImagesToCloudinary(images)
            uploadedImages = [...imagesUrl]
        }
        await db.runTransaction(async t => {
            const productSnapshot = await t.get(productRef)
            if (!productSnapshot.exists) {
                throw new AppError(404, "product not found")
            }
            const product = productSnapshot.data() as CreateProductRequest & { images: string[] }
            let imagesUrl = product.images
            if (deletedImages) {
                deletedImages.forEach(img => {
                    imagesUrl = imagesUrl.filter(imageUrl => imageUrl !== img)
                })
            }
            imagesUrl = [...imagesUrl, ...uploadedImages]
            if (imagesUrl.length === 0) throw new AppError(400, undefined, { images: "at least 1 image is required" })
            let updated: UpdateProductRequest & { images?: string[] } = { images: imagesUrl }
            if (Object.keys(rest).length > 0) {
                updated = { ...updated, ...rest }
            }
            t.update(productRef, updated)
        })
    } catch (error) {
        // can delete recently uploaded here
        if (error instanceof AppError) throw error
        else throw new AppError(500, "unable to update product")
    }
}
export async function deleteProduct(id: string) {
    const product = await productsRef.doc(id).get()
    if (!product.exists) throw new AppError(404, "product not found")
    await productsRef.doc(id).delete()
}

export async function getProducts(params: QueryType, user?: UserPayload) {
    const isAdmin = (user && user.role === "ADMIN") ? true : false
    const { page, query: value, pageSize } = params

    const size = pageSize || MAX_PAGE_SIZE
    const startAfter = (page - 1) * size
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>
    let queryCount = productsRef.count()
    if (value) {
        let baseQuery = productsRef.where("name", ">=", value).where(Filter.or(Filter.where("name", "<=", value + "\uf8ff"), Filter.where("categories", "array-contains", value))).where("quantity", ">", 0)
        if (!isAdmin) { baseQuery = baseQuery.where("quantity", ">", 0).offset(startAfter).limit(size) }
        query = baseQuery.offset(startAfter)
        queryCount = baseQuery.count()
    }
    else {
        if (!isAdmin) {
            query = productsRef.where("quantity", ">", 0).offset(startAfter).limit(size);
        }
        else {
            query = productsRef.offset(startAfter)
        }


    }
    const snapshot = await query.get()
    const count = await queryCount.get()
    const data = snapshot.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        }
    })
    return {
        data, count: count.data().count
    }
}
export async function getSingleProduct(id: string) {
    const product = await productsRef.doc(id).get()
    if (!product.exists) throw new AppError(404, `product with id:${id} was not found`)
    return {
        id: product.id, ...product.data()
    }
}