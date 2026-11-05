import express from "express";
import { protect,restrictTo } from "../middleware/authMiddleware.js";

import { createPurchase,getAllPurchases,
    getPurchase,deletePurchase,getPurchasesReport,
    updatePurchase,
} from "../controllers/purchaseController.js";


const router = express.Router();

router.post("/",protect,restrictTo("admin"), createPurchase);
router.get("/",protect,restrictTo("admin"), getAllPurchases);
router.get("/report",protect,restrictTo("admin"), getPurchasesReport);
router.get("/:id",protect,restrictTo("admin"), getPurchase);
router.delete("/:id",protect,restrictTo("admin"),deletePurchase);
router.patch("/:id",protect,restrictTo("admin"),updatePurchase);


export default router;