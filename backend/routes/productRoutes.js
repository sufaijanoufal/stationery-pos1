import express from "express";
import { protect,restrictTo } from "../middleware/authMiddleware.js";
import {
    createProduct ,
    getAllProducts, 
    getProduct,
    getProductByBarcode,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
 } from "../controllers/productController.js";


const router = express.Router();

router.get("/barcode/:barcode",protect,getProductByBarcode);

router.post("/",protect,restrictTo("admin"),createProduct);
router.get("/",protect,getAllProducts);
router.get("/low-stock",protect,restrictTo("admin"), getLowStockProducts);
router.get("/:id",protect,restrictTo("admin"), getProduct);
router.patch("/:id",protect,restrictTo("admin"), updateProduct);
router.delete("/:id",protect,restrictTo("admin"), deleteProduct);


export default router;