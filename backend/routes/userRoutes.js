import express from "express";
import {protect,restrictTo } from "../middleware/authMiddleware.js";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  updateUser,
  changePassword,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", protect,restrictTo("admin"),createUser);
router.post("/login", loginUser);
router.get("/",protect,restrictTo("admin"), getAllUsers);
router.patch("/:id/change-password",protect, changePassword);
router.get("/:id",protect,restrictTo("admin"), getUser);
router.patch("/:id",protect,updateUser);
router.delete("/:id",protect,restrictTo("admin"), deleteUser);


export default router;