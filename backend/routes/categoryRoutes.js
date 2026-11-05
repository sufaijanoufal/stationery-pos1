import express from "express";
import { protect,restrictTo } from "../middleware/authMiddleware.js";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/",protect,restrictTo("admin"),createCategory);
router.get("/", protect,restrictTo("admin"),getAllCategories);
router.get("/:id",protect,restrictTo("admin"), getCategory);
router.patch("/:id",protect,restrictTo("admin"), updateCategory);
router.delete("/:id",protect,restrictTo("admin"), deleteCategory);


export default router;