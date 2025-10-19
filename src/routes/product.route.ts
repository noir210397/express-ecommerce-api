import { Router } from "express";
import { createProductHandler, deleteProductHandler, getProductsHandler, getSingleProductHandler, updateProductHandler } from "src/controllers/product.controller";
import { authorize } from "src/middlewares/auth.middleware";
import fileUploadHandler from "src/middlewares/upload.middleware";
import { validateIdParam } from "src/middlewares/validate-id.middleware";

const router = Router()
const routeName = "product"
router.get("/", getProductsHandler)

router.get("/:id", validateIdParam(routeName), getSingleProductHandler)

router.post("/", authorize("ADMIN"), fileUploadHandler, createProductHandler)

router.put("/:id", authorize("ADMIN"), validateIdParam(routeName), fileUploadHandler, updateProductHandler)

router.delete("/:id", authorize("ADMIN"), validateIdParam(routeName), deleteProductHandler)

export default router