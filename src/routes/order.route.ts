import { Router } from "express";
import { deleteOrderHandler, getOrdersHandler, getSingleOrderHandler, updateOrderHandler } from "src/controllers/order.controller";
import { authorize } from "src/middlewares/auth.middleware";
import { validateIdParam } from "src/middlewares/validate-id.middleware";

const router = Router()

router.get("/", authorize(), getOrdersHandler)
router.get("/:id", authorize("ADMIN"), validateIdParam("order"), getSingleOrderHandler)
router.put("/:id", authorize("ADMIN"), validateIdParam("order"), updateOrderHandler)
router.delete("/:id", authorize("ADMIN"), validateIdParam("order"), deleteOrderHandler)

export default router