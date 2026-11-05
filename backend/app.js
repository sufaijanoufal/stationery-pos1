import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import DashboardRoutes from "./routes/dashboardRoutes.js"; 
import userRoutes from "./routes/userRoutes.js"; 
import expenseRoutes from "./routes/expenseRoutes.js";    
import { globalErrorHandler } from "./middleware/errorHandler.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

app.use(globalErrorHandler);

export default app;