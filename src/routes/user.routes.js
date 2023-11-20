import { Router } from "express";
import {getUsers, getUser, createUser, updateUser, deleteUser} from '../controllers/user.controller.js'
import { verifyToken } from "../controllers/verifyToken.controller.js";

const router = Router()

router.get("/user", verifyToken, getUsers)
router.get("/user/:id", verifyToken, getUser)
router.post("/user", verifyToken, createUser)
router.patch("/user/:id", verifyToken, updateUser)
router.delete("/user/:id", verifyToken, deleteUser)

export default router