import Category from "../models/categoryModel.js";
import { createOne, getAll, getOne, updateOne, deleteOne} from "./handlerFactory.js";
import catchAsync from "../utils/catchAsync.js";

// Same idea as products: a deleted category name can be used again.
export const createCategory = catchAsync(async (req, res) => {
  const name = String(req.body.name || "").trim();

  const deleted = name ? await Category.findOne({ name, active: false }) : null;

  let category;

  if (deleted) {
    deleted.active = true;
    category = await deleted.save();
  } else {
    category = await Category.create(req.body);
  }

  res.status(201).json({ status: "success", data: category });
});

export const getAllCategories = getAll(Category);

export const getCategory = getOne(Category);

export const updateCategory = updateOne(Category);

export const deleteCategory = deleteOne(Category);