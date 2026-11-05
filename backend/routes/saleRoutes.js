import express from "express";
import {protect,restrictTo} from "../middleware/authMiddleware.js";
import { createSale, deleteSale, getAllSales ,getSale ,getSalesReport
} from "../controllers/saleController.js";

const router = express.Router();

router.post("/",protect, createSale);   
router.get("/",protect, getAllSales);
router.get("/report",protect,restrictTo("admin"), getSalesReport);
router.get("/:id",protect, getSale);
router.delete("/:id",protect,restrictTo("admin"), deleteSale);

export default router;