import express from "express";
import {
  getSale,
  addSale,
  saleById,
  updateSale,
  deleteSale,
} from "../controllers/sale.js";

const router = express.Router();

router.get("/getSale", getSale);
router.post("/addSale", addSale);
router.get("/find/:SaleId", saleById);
router.put("/update/:SaleId", updateSale);
router.delete("/delete/:SaleId", deleteSale);
export default router;
