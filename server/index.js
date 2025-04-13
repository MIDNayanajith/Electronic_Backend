import express from "express";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/item.js";
import supplierRoutes from "./routes/suppliers.js";
import purchaseRoutes from "./routes/purchase.js";
import saleRoutes from "./routes/sale.js";
import invoiceRoutes from "./routes/invoice.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
const app = express();

app.listen(8800, () => {
  console.log("Server is running!");
});

//middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/sale", saleRoutes);
app.use("/api/invoice", invoiceRoutes);
