import mongoose from "mongoose";
import {getAll,getOne} from "./handlerFactory.js";
import Purchase from "../models/purchaseModel.js";
import Product from "../models/productModel.js";
import catchAsync from "../utils/catchAsync.js";

export const createPurchase = catchAsync(async (req, res) => {
 const { supplier, invoiceNumber, purchaseDate, items } = req.body;

if (
  !purchaseDate ||
  typeof purchaseDate !== "string" ||
  !purchaseDate.trim()
) {
  const error = new Error("Purchase date is required");
  error.statusCode = 400;
  throw error;
}

const parsedPurchaseDate = new Date(purchaseDate);

if (Number.isNaN(parsedPurchaseDate.getTime())) {
  const error = new Error("Please provide a valid purchase date");
  error.statusCode = 400;
  throw error;
}
  if (!supplier) {
    const error = new Error("Supplier is required");
    error.statusCode = 400;
    throw error;
  }

  if (!items || items.length === 0) {
    const error = new Error("Purchase must contain at least one item");
    error.statusCode = 400;
    throw error;
  }

 const updatedItems = items.map((item) => {
  if (!item.product) {
    const error = new Error("Product is required");
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isFinite(Number(item.quantity)) ||
    Number(item.quantity) <= 0
  ) {
    const error = new Error("Quantity must be greater than 0");
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isFinite(Number(item.purchasePrice)) ||
    Number(item.purchasePrice) < 0
  ) {
    const error = new Error("Purchase price must be a valid number");
    error.statusCode = 400;
    throw error;
  }

  const quantity = Number(item.quantity);
  const purchasePrice = Number(item.purchasePrice);

  return {
    product: item.product,
    quantity,
    purchasePrice,
    total: quantity * purchasePrice,
  };
});


 const totalAmount = updatedItems.reduce(
  (sum, item) => sum + item.total,
  0
);

  const session = await mongoose.startSession();
  let purchase;
  try {
    await session.withTransaction(async () => {
      //create the purchase document
  [purchase] =await Purchase.create(
  [
  {
    supplier,
    invoiceNumber,
    purchaseDate,
    items: updatedItems,
    totalAmount,
  }
],
{session}
  );

  //Increase the stock of the purchased products

for (const item of updatedItems) {
   const product = await Product.findOneAndUpdate(
    {
      _id: item.product,
      active: true,
    },
    {
      $inc: { currentStock: item.quantity },
    },
    { new: true, runValidators: true,session }
  );

  if(!product) {
    const error = new Error(`Product with ID ${item.product} not found or inactive`);
    error.statusCode = 404;
    throw error;
  }
}
    });
  }finally {
    await session.endSession();
  }
res.status(201).json({
    status: "success",
    data: 
      purchase,
    
  });
});

export const getAllPurchases = getAll(
    Purchase,
    { active: true },
    [
        {
            path: "supplier",
        },
        {
            path: "items.product",
        },
    ]
);
export const getPurchase = getOne(Purchase,[
  {
    path: "items.product",
    select: "name currentStock purchasePrice sellingPrice",
  },
    {
        path: "supplier",
        select: "name email",
    },
]);




export const getPurchasesReport = catchAsync(async (req, res) => {
  const { from, to } = req.query;

  const filter = {
    active: true,
  };


if (from && to) {
  const IST_OFFSET_MS = 330 * 60 * 1000;

  const getISTBoundary = (dateString, isEnd = false) => {
    const [year, month, day] = dateString.split("-").map(Number);

    const utcTime = Date.UTC(
      year,
      month - 1,
      day,
      isEnd ? 23 : 0,
      isEnd ? 59 : 0,
      isEnd ? 59 : 0,
      isEnd ? 999 : 0
    );

    return new Date(utcTime - IST_OFFSET_MS);
  };

  const startDate = getISTBoundary(from);
  const endDate = getISTBoundary(to, true);

  filter.purchaseDate = {
    $gte: startDate,
    $lte: endDate,
  };
}


  const purchases = await Purchase.find(filter)
    .populate([
      {
        path: "items.product",
        select: "name currentStock purchasePrice sellingPrice",
      },
      {
        path: "supplier",
        select: "name email",
      },
    ])
    .sort({ purchaseDate: -1 });

  const totalPurchases = purchases.reduce(
    (total, purchase) => total + purchase.totalAmount,
    0
  );

  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: {
      totalPurchases,
      purchases,
    },
  });
});

export const updatePurchase = catchAsync(async (req, res) => {
  const { supplier, invoiceNumber, purchaseDate, items } = req.body;
// Validate purchase date
if (
  !purchaseDate ||
  typeof purchaseDate !== "string" ||
  !purchaseDate.trim()
) {
  const error = new Error("Purchase date is required");
  error.statusCode = 400;
  throw error;
}

const parsedPurchaseDate = new Date(purchaseDate);

if (Number.isNaN(parsedPurchaseDate.getTime())) {
  const error = new Error("Please provide a valid purchase date");
  error.statusCode = 400;
  throw error;
}
  // 1. Validate supplier
  if (!supplier) {
    const error = new Error("Supplier is required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate items
  if (!items || items.length === 0) {
    const error = new Error("Purchase must contain at least one item");
    error.statusCode = 400;
    throw error;
  }

  // 3. Validate and prepare items
  const updatedItems = items.map((item) => {
    if (!item.product) {
      const error = new Error("Product is required");
      error.statusCode = 400;
      throw error;
    }

    if (
      !Number.isFinite(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      const error = new Error("Quantity must be greater than 0");
      error.statusCode = 400;
      throw error;
    }

    if (
      !Number.isFinite(Number(item.purchasePrice)) ||
      Number(item.purchasePrice) < 0
    ) {
      const error = new Error("Purchase price must be a valid number");
      error.statusCode = 400;
      throw error;
    }

    const quantity = Number(item.quantity);
    const purchasePrice = Number(item.purchasePrice);

    return {
      product: item.product,
      quantity,
      purchasePrice,
      total: quantity * purchasePrice,
    };
  });

  // 4. Calculate total amount
  const totalAmount = updatedItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // 5. Start MongoDB transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 6. Get existing purchase
      const purchase = await Purchase.findOne({
        _id: req.params.id,
        active: true,
      }).session(session);

      if (!purchase) {
        const error = new Error("Purchase not found");
        error.statusCode = 404;
        throw error;
      }

   
      // 7. Reverse old stock safely
      for (const item of purchase.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.product,
            currentStock: { $gte: item.quantity },
          },
          {
            $inc: {
              currentStock: -item.quantity,
            },
          },
          {
            new: true,
            session,
          }
        );

        if (!product) {
          const existingProduct = await Product.findById(
            item.product
          ).session(session);

          if (!existingProduct) {
            const error = new Error(
              `Product with ID ${item.product} not found`
            );
            error.statusCode = 404;
            throw error;
          }

          const error = new Error(
            `Cannot edit this purchase. Insufficient stock for "${existingProduct.name}". Current stock is ${existingProduct.currentStock}, but ${item.quantity} units must be removed.`
          );
          error.statusCode = 400;
          throw error;
        }
      }
const oldProductIds = purchase.items.map(
  (item) => item.product.toString()
);
     // 8. Add new stock
for (const item of updatedItems) {
  const isOldProduct = oldProductIds.includes(
    item.product.toString()
  );

  const product = await Product.findOneAndUpdate(
    {
      _id: item.product,
      ...(isOldProduct ? {} : { active: true }),
    },
    {
      $inc: {
        currentStock: item.quantity,
      },
    },
    {
      new: true,
      session,
    }
  );

  if (!product) {
    const error = new Error(
      `Product with ID ${item.product} not found or inactive`
    );
    error.statusCode = 404;
    throw error;
  }
}
      // 9. Update purchase
      purchase.supplier = supplier;
      purchase.invoiceNumber = invoiceNumber;
      purchase.purchaseDate = purchaseDate;
      purchase.items = updatedItems;
      purchase.totalAmount = totalAmount;

      await purchase.save({ session });

      // 10. Send response
      res.status(200).json({
        status: "success",
        data: purchase,
      });
    });
  } finally {
    await session.endSession();
  }
});

export const deletePurchase = catchAsync(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const purchase = await Purchase.findById(req.params.id).session(session);

      if (!purchase) {
        const error = new Error("Purchase not found");
        error.statusCode = 404;
        throw error;
      }

      if (!purchase.active) {
        const error = new Error("Purchase is already deleted");
        error.statusCode = 400;
        throw error;
      }

      // Validate every product before changing any stock
      for (const item of purchase.items) {
        const product = await Product.findById(item.product).session(session);

        if (!product) {
          const error = new Error(
            "A product from this purchase no longer exists"
          );
          error.statusCode = 400;
          throw error;
        }

        if (product.currentStock < item.quantity) {
          const error = new Error(
            `Cannot delete this purchase because ${product.name} has insufficient stock. Some of the purchased stock may already have been sold.`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      // Reverse stock within the same transaction
      for (const item of purchase.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.product,
            active: true,
            currentStock: { $gte: item.quantity },
          },
          {
            $inc: { currentStock: -item.quantity },
          },
          {
           returnDocument: "after",
            runValidators: true,
            session,
          }
        );

        if (!product) {
          const error = new Error(
            "Stock changed during deletion. Please try again."
          );
          error.statusCode = 409;
          throw error;
        }
      }

      // Mark the purchase inactive in the same transaction
      purchase.active = false;
      await purchase.save({ session });
    });
  } finally {
    await session.endSession();
  }

  res.status(200).json({
    status: "success",
    message: "Purchase deleted successfully",
    data: null,
  });
});
