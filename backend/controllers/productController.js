import Product from "../models/productModel.js";
import catchAsync from "../utils/catchAsync.js";
import {createOne, getAll, getOne, updateOne, deleteOne} from "./handlerFactory.js";


// A deleted product only has active=false, so its barcode stays "taken".
// If someone re-creates a product with that barcode, bring the old record back.
export const createProduct = catchAsync(async (req, res) => {
  const barcode = String(req.body.barcode || "").trim();

  const deleted = barcode
    ? await Product.findOne({ barcode, active: false })
    : null;

  let product;

  if (deleted) {
    // stock restarts at 0 unless the form sends a value
    deleted.set({ currentStock: 0, ...req.body, barcode, active: true });
    product = await deleted.save();
  } else {
    product = await Product.create(req.body);
  }

  res.status(201).json({ status: "success", data: product });
});
export const getAllProducts = getAll(
    Product,
    { active: true },
    [
        {
            path: "category",
        },
    ]
);

export const getProduct = getOne(Product,[
  {
    path: "category",
  },
  {
    path:"supplier",
  }
]);

   

export const updateProduct = updateOne(Product);

export const deleteProduct = deleteOne(Product);

export const getProductByBarcode = catchAsync(async (req, res) => {
  const product = await Product.findOne({
    barcode: req.params.barcode,
    active: true,
  })
    .populate("category")
    .populate("supplier");

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const getLowStockProducts = catchAsync(async (req, res) => {
    const products = await Product.find({
        active: true,
        $expr: {
            $lte: ["$currentStock", "$minimumStock"],
        },
    })
        .populate("category")
       

    res.status(200).json({
        status: "success",
        results: products.length,
        data: {
            products,
        },
    });
});