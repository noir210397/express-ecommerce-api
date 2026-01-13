"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductHandler = exports.updateProductHandler = exports.createProductHandler = exports.getSingleProductHandler = exports.getProductsHandler = void 0;
const firebase_config_1 = require("../config/firebase.config");
const api_error_1 = require("../errors/api.error");
const product_schema_1 = require("../schemas/product.schema");
const query_schema_1 = require("../schemas/query.schema");
const product_service_1 = require("../services/product.service");
const getProductsHandler = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            req.user = await firebase_config_1.auth.verifyIdToken(token);
        }
        catch (error) {
            throw new api_error_1.AppError(403, "invalid or expired token");
        }
    }
    const { success, data, } = query_schema_1.querySchema.safeParse(req.query);
    const query = success ? data : { page: 1 };
    const products = await (0, product_service_1.getProducts)(query, req.user);
    return res.json(products);
};
exports.getProductsHandler = getProductsHandler;
const getSingleProductHandler = async (req, res) => {
    const product = await (0, product_service_1.getSingleProduct)(req.params.id);
    return res.json(product);
};
exports.getSingleProductHandler = getSingleProductHandler;
const createProductHandler = async (req, res) => {
    const { success, data, error } = product_schema_1.createProductSchema.safeParse(req.body);
    let errors = {};
    if (!req.areFilesValid || !req.files || req.files.length === 0) {
        errors["images"] = "At least 1 and at most 10 images are required. Allowed types: image/jpeg, image/jpg, image/png.";
    }
    if (!success) {
        errors = { ...(0, api_error_1.formatZodError)(error), ...errors };
    }
    else {
        if (Object.keys(errors).length > 0) {
            throw new api_error_1.AppError(400, undefined, errors);
        }
        const files = req.files;
        const buffers = files.map(file => file.buffer);
        await (0, product_service_1.createProduct)({ ...data, images: buffers });
        return res.sendStatus(201);
    }
};
exports.createProductHandler = createProductHandler;
const updateProductHandler = async (req, res) => {
    const { success, data, error } = product_schema_1.updateProductSchema.safeParse(req.body || {});
    let errors = {};
    if (!req.areFilesValid) {
        errors["images"] = "At least 1 and at most 10 images are required. Allowed types: image/jpeg, image/jpg, image/png.";
    }
    if (!success) {
        errors = { ...(0, api_error_1.formatZodError)(error), ...errors };
        throw new api_error_1.AppError(400, undefined, errors);
    }
    else {
        if (Object.keys(errors).length > 0) {
            throw new api_error_1.AppError(400, undefined, errors);
        }
        const files = !req.files ? [] : req.files;
        const buffers = files.map(file => file.buffer);
        await (0, product_service_1.updateProduct)({ ...data, images: buffers }, req.params.id);
        return res.sendStatus(204);
    }
};
exports.updateProductHandler = updateProductHandler;
const deleteProductHandler = async (req, res) => {
    await (0, product_service_1.deleteProduct)(req.params.id);
    return res.sendStatus(204);
};
exports.deleteProductHandler = deleteProductHandler;
