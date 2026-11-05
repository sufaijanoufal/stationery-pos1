
import express from "express";
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router
  .route("/")
  .get(getAllExpenses)
  .post(createExpense);

router
  .route("/:id")
  .patch(updateExpense)
  .delete(deleteExpense);

export default router;
