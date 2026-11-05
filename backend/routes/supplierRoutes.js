import express from "express";
import { protect,restrictTo } from "../middleware/authMiddleware.js";
import {
  createSupplier,
  getAllSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplierController.js";

const router = express.Router();

router.post("/",protect,restrictTo("admin"),createSupplier);
router.get("/",protect,restrictTo("admin"), getAllSuppliers);
router.get("/:id",protect,restrictTo("admin"), getSupplier);
router.patch("/:id",protect,restrictTo("admin"), updateSupplier);
router.delete("/:id",protect,restrictTo("admin"), deleteSupplier);


export default router;