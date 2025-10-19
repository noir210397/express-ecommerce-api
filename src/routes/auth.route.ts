import { Router } from "express";
import { checkAdmin, createUserHandler, deleteUserHandler } from "src/controllers/auth.controller";
import { authorize } from "src/middlewares/auth.middleware";

const router = Router()

router.post("/", createUserHandler)
router.post("/check-admin", checkAdmin)
router.delete("/:id", authorize("USER,ADMIN"), deleteUserHandler)

export default router