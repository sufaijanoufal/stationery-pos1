import mongoose from "mongoose";
import Sale from "../models/saleModel.js";
import Product from "../models/productModel.js";
import catchAsync from "../utils/catchAsync.js";
import {getAll,getOne} from "./handlerFactory.js";
import Counter from "../models/counterModel.js";



export const createSale = catchAsync(async (req, res) => {
  const { saleDate, items, paymentMethod } = req.body;

  // 1. Validate the request before changing stock
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Sale must have at least one item.");
    error.statusCode = 400;
    throw error;
  }

  const validPaymentMethods = ["Cash", "GPay"];

  if (
    paymentMethod !== undefined &&
    !validPaymentMethods.includes(paymentMethod)
  ) {
    const error = new Error("Invalid payment method.");
    error.statusCode = 400;
    throw error;
  }

  for (const item of items) {
    if (
      !item.product ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      const error = new Error(
        "Each sale item must have a product and a positive whole-number quantity."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 2. Start a transaction
  const session = await mongoose.startSession();
  let createdSale;

  try {
    await session.withTransaction(async () => {
      let totalAmount = 0;
      const saleItems = [];

      // 3. Check products and deduct stock atomically
      for (const item of items) {
        const quantity = Number(item.quantity);

        const product = await Product.findById(item.product)
          .session(session);

        if (!product) {
          const error = new Error(
            `Product not found: ${item.product}`
          );
          error.statusCode = 404;
          throw error;
        }

        // The stock condition and deduction happen in one operation.
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: product._id,
            currentStock: { $gte: quantity },
          },
          {
            $inc: { currentStock: -quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedProduct) {
          const error = new Error(
            `Insufficient stock for ${product.name}. Please refresh stock and try again.`
          );
          error.statusCode = 400;
          throw error;
        }

        const sellingPrice = product.sellingPrice;
        const total = sellingPrice * quantity;

        saleItems.push({
          product: product._id,
          quantity,
          sellingPrice,
          total,
        });

        totalAmount += total;
      }

      // 4. Generate the invoice number in the same transaction
      const counter = await Counter.findOneAndUpdate(
        { _id: "saleInvoice" },
        { $inc: { sequence: 1 } },
        {
          new: true,
          upsert: true,
          session,
        }
      );

      const invoiceNumber =
        `BILL-${String(counter.sequence).padStart(4, "0")}`;

      // 5. Create the bill in the same transaction
      const sales = await Sale.create(
        [{
          invoiceNumber,
          saleDate,
          items: saleItems,
          totalAmount,
          paymentMethod: paymentMethod || "Cash",
          soldBy: req.user._id,
        }],
        { session }
      );

      createdSale = sales[0];
    });

    // Respond only after the transaction commits successfully
    res.status(201).json({
      status: "success",
      data: createdSale,
    });
  } finally {
    await session.endSession();
  }
});




export const getAllSales = getAll(Sale, { active: true }, [
    {
        path: "items.product",
        select: "name sellingPrice barcode currentStock",
    },
    {
        path: "soldBy",
        select: "name role",
    },
]);

export const getSale = getOne(Sale,[
    {
        path: "items.product",
        select: "name sellingPrice barcode currentStock",
    },
]);

export const deleteSale = catchAsync(async (req, res) => {
    const sale = await Sale.findById(req.params.id);

    if(!sale){
        const error = new Error("Sale not found");
        error.statusCode = 404;
        throw error;
    }

    if(!sale.active){
        const error = new Error("Sale is already inactive");
        error.statusCode = 400;
        throw error;
    }

    //restore stock
    for (const item of sale.items) {
        await Product.findByIdAndUpdate(
            item.product,
            {
                $inc: {
                    currentStock: item.quantity,
                },
            }
        );
    }
    //soft delete the sale
    sale.active = false;
    await sale.save();

    res.status(200).json({
        status: "success",
        message: "Sale cleared successfully",
    });
});

//sales report

export const getSalesReport = catchAsync(async (req, res) => {
    const { from, to } = req.query;

    const filter = {
        active: true,
    };


if (from && to) {
    // Interpret report dates as India business dates (IST, UTC+5:30).
    const startDate = new Date(`${from}T00:00:00.000+05:30`);

    // Exclusive end boundary: midnight IST on the day after "to".
    const endDate = new Date(`${to}T00:00:00.000+05:30`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    filter.saleDate = {
        $gte: startDate,
        $lt: endDate,
    };
}


    const sales = await Sale.find(filter)
        .populate({
            path: "items.product",
            select: "name sellingPrice barcode currentStock",
        })
        .populate({
            path: "soldBy",
            select: "name role",
        });

    const totalSales = sales.reduce(
        (total, sale) => total + sale.totalAmount,
        0
    );

    const staffMap = {};

    sales.forEach((sale) => {
        const staffId = sale.soldBy?._id?.toString() || "unassigned";
        const staffName = sale.soldBy?.name || "Unassigned";

        if (!staffMap[staffId]) {
            staffMap[staffId] = {
                staffId,
                staffName,
                role: sale.soldBy?.role || "unknown",
                totalSales: 0,
                totalTransactions: 0,
                cashSales: 0,
                gpaySales: 0,
            };
        }

        const amount = Number(sale.totalAmount || 0);

        staffMap[staffId].totalSales += amount;
        staffMap[staffId].totalTransactions += 1;

        if ((sale.paymentMethod || "Cash") === "Cash") {
            staffMap[staffId].cashSales += amount;
        } else if (sale.paymentMethod === "GPay") {
            staffMap[staffId].gpaySales += amount;
        }
    });

    res.status(200).json({
        status: "success",
        data: {
            sales,
            totalSales,
            staffSales: Object.values(staffMap),
        },
    });
});



  

