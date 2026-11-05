import Sale from '../models/saleModel.js';
import Purchase from '../models/purchaseModel.js';
import Product from '../models/productModel.js';    
import catchAsync from '../utils/catchAsync.js';

export const getDashboard = catchAsync(async (req,res) => {
    

const { from, to } = req.query;

const TIMEZONE_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = TIMEZONE_OFFSET_MINUTES * 60 * 1000;

const getISTDayBoundary = (dateString, isEnd = false) => {
  const [year, month, day] = dateString.split("-").map(Number);

  // Build the requested calendar date in India time.
  const utcDate = Date.UTC(
    year,
    month - 1,
    day,
    isEnd ? 23 : 0,
    isEnd ? 59 : 0,
    isEnd ? 59 : 0,
    isEnd ? 999 : 0
  );

  return new Date(utcDate - IST_OFFSET_MS);
};

const getISTDateString = () => {
  return new Date(Date.now() + IST_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
};

const todayIST = getISTDateString();

const startDate = getISTDayBoundary(from || todayIST);
const endDate = getISTDayBoundary(to || todayIST, true);

   
    const sales = await Sale.find({
        active: true,
        saleDate: { 
            $gte: startDate,
            $lte: endDate }  ,
});

const todaySales = sales.reduce(
    (total, sale) => total + sale.totalAmount, 0);

   

const purchases = await Purchase.find({
        active: true,
        purchaseDate: { 
            $gte: startDate,
            $lte: endDate }  ,
});

const todayPurchases = purchases.reduce(
    (total, purchase) => total + purchase.totalAmount, 0);

    

const totalProducts = await Product.countDocuments({
  active: true,
});

const lowStockProducts = await Product.countDocuments({
  active: true,
  $expr: {
    $lte: ["$currentStock", "$minimumStock"],
  },
});

const lowStockProductList = await Product.find({
    active:true,
    $expr: {
        $lte:["$currentStock","$minimumStock"],
    },
}).select("name currentStock minimumStock");

const todaySalesCount = sales.length;
const todayPurchasesCount = purchases.length;


let thisMonthSales = 0;
let thisMonthPurchases = 0;

if (req.user.role === "admin") {
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const endOfMonth = new Date();
endOfMonth.setMonth(endOfMonth.getMonth() + 1);
endOfMonth.setDate(0);
endOfMonth.setHours(23, 59, 59, 999);


const monthSales = await Sale.find({
    active: true,
    saleDate: {
        $gte: startOfMonth,
        $lte: endOfMonth,
    },
});

const monthPurchases = await Purchase.find({
    active: true,
    purchaseDate: {
        $gte: startOfMonth,
        $lte: endOfMonth,
    },
});
 
 thisMonthSales = monthSales.reduce(
    (total, sale) => total + sale.totalAmount, 0);

 thisMonthPurchases = monthPurchases.reduce(
    (total, purchase) => total + purchase.totalAmount, 0);

}

const responseData = {
    todayPurchases,
    todaySales,
    todaySalesCount,
    todayPurchasesCount,
    totalProducts,
    lowStockProducts,
    lowStockProductList,
};

if (req.user.role === "admin") {
    responseData.thisMonthSales = thisMonthSales;
    responseData.thisMonthPurchases = thisMonthPurchases;
}

res.status(200).json({
    status: "success",
    data: responseData,
});
});
       
        