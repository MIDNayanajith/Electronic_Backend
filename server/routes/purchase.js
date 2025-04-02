import express from "express";
import {
  getPurchase,
  addPurchase,
  purchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchase.js";
const router = express.Router();

router.get("/getPurchase", getPurchase);
router.post("/addPurchase", addPurchase);
router.get("/find/:PurchaseId", purchaseById);
router.put("/update/:PurchaseId", updatePurchase);
router.delete("/delete/:PurchaseId", deletePurchase);
export default router;
