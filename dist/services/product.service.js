"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getProducts = getProducts;
exports.getSingleProduct = getSingleProduct;
const firestore_1 = require("firebase-admin/firestore");
const cloudinary_config_1 = require("../config/cloudinary.config");
const firebase_config_1 = require("../config/firebase.config");
const constants_1 = require("../constants/constants");
const api_error_1 = require("../errors/api.error");
const productsRef = firebase_config_1.db.collection("products");
async function createProduct(productToCreate) {
    const { images, ...rest } = productToCreate;
    try {
        const uploadedImages = await (0, cloudinary_config_1.uploadImagesToCloudinary)(images);
        await productsRef.add({ ...rest, images: uploadedImages });
    }
    catch (error) {
        throw new api_error_1.AppError(500, "unable to create product due to server error");
    }
}
async function updateProduct(productToUpdate, id) {
    const productRef = productsRef.doc(id);
    const { images, deletedImages, ...rest } = productToUpdate;
    let uploadedImages = [];
    try {
        if (images && images.length) {
            const imagesUrl = await (0, cloudinary_config_1.uploadImagesToCloudinary)(images);
            uploadedImages = [...imagesUrl];
        }
        await firebase_config_1.db.runTransaction(async (t) => {
            const productSnapshot = await t.get(productRef);
            if (!productSnapshot.exists) {
                throw new api_error_1.AppError(404, "product not found");
            }
            const product = productSnapshot.data();
            let imagesUrl = product.images;
            if (deletedImages) {
                deletedImages.forEach(img => {
                    imagesUrl = imagesUrl.filter(imageUrl => imageUrl !== img);
                });
            }
            imagesUrl = [...imagesUrl, ...uploadedImages];
            if (imagesUrl.length === 0)
                throw new api_error_1.AppError(400, undefined, { images: "at least 1 image is required" });
            let updated = { images: imagesUrl };
            if (Object.keys(rest).length > 0) {
                updated = { ...updated, ...rest };
            }
            t.update(productRef, updated);
        });
    }
    catch (error) {
        // can delete recently uploaded here
        if (error instanceof api_error_1.AppError)
            throw error;
        else
            throw new api_error_1.AppError(500, "unable to update product");
    }
}
async function deleteProduct(id) {
    const product = await productsRef.doc(id).get();
    if (!product.exists)
        throw new api_error_1.AppError(404, "product not found");
    await productsRef.doc(id).delete();
}
async function getProducts(params, user) {
    const isAdmin = (user && user.role === "ADMIN") ? true : false;
    const { page, query: value, pageSize } = params;
    const size = pageSize || constants_1.MAX_PAGE_SIZE;
    const startAfter = (page - 1) * size;
    let query;
    let queryCount = productsRef.count();
    if (value) {
        let baseQuery = productsRef.where("name", ">=", value).where(firestore_1.Filter.or(firestore_1.Filter.where("name", "<=", value + "\uf8ff"), firestore_1.Filter.where("categories", "array-contains", value))).where("quantity", ">", 0);
        if (!isAdmin) {
            baseQuery = baseQuery.where("quantity", ">", 0).offset(startAfter).limit(size);
        }
        query = baseQuery.offset(startAfter);
        queryCount = baseQuery.count();
    }
    else {
        if (!isAdmin) {
            query = productsRef.where("quantity", ">", 0).offset(startAfter).limit(size);
        }
        else {
            query = productsRef.offset(startAfter);
        }
    }
    const snapshot = await query.get();
    const count = await queryCount.get();
    const data = snapshot.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        };
    });
    return {
        data, count: count.data().count
    };
}
async function getSingleProduct(id) {
    const product = await productsRef.doc(id).get();
    if (!product.exists)
        throw new api_error_1.AppError(404, `product with id:${id} was not found`);
    return {
        id: product.id, ...product.data()
    };
}
