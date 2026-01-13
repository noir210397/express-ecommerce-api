"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = __importDefault(require("../middlewares/upload.middleware"));
const validate_id_middleware_1 = require("../middlewares/validate-id.middleware");
const router = (0, express_1.Router)();
const routeName = "product";
router.get("/", product_controller_1.getProductsHandler);
router.get("/:id", (0, validate_id_middleware_1.validateIdParam)(routeName), product_controller_1.getSingleProductHandler);
router.post("/", (0, auth_middleware_1.authorize)("ADMIN"), upload_middleware_1.default, product_controller_1.createProductHandler);
router.put("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_id_middleware_1.validateIdParam)(routeName), upload_middleware_1.default, product_controller_1.updateProductHandler);
router.delete("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_id_middleware_1.validateIdParam)(routeName), product_controller_1.deleteProductHandler);
exports.default = router;
