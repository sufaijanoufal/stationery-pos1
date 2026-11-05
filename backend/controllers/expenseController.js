
import Expense from "../models/expenseModel.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllExpenses = catchAsync(async (req, res) => {
  const expenses = await Expense.find({ active: true })
    .populate("createdBy", "name")
    .sort({ expenseDate: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: expenses.length,
    data: expenses,
  });
});

export const createExpense = catchAsync(async (req, res) => {
  const { category, amount, expenseDate, note } = req.body;

  const expense = await Expense.create({
    category,
    amount,
    expenseDate: expenseDate || Date.now(),
    note,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: expense,
  });
});

export const updateExpense = catchAsync(async (req, res) => {
  const { category, amount, expenseDate, note } = req.body;

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, active: true },
    { category, amount, expenseDate, note },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!expense) {
    return res.status(404).json({
      status: "fail",
      message: "Expense not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: expense,
  });
});

export const deleteExpense = catchAsync(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, active: true },
    { active: false },
    { new: true }
  );

  if (!expense) {
    return res.status(404).json({
      status: "fail",
      message: "Expense not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Expense deleted successfully",
  });
});
