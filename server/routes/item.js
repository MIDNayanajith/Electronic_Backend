import express from "express";
import {
  getItem,
  addItem,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/item.js";
import { uploadProduct } from "../upload.js";

const router = express.Router();

router.get("/getItem", getItem);
router.post("/addItem", uploadProduct.single("image"), addItem);
router.get("/find/:ItemId", getItemById);
router.put("/update/:ItemId", uploadProduct.single("image"), updateItem);
router.delete("/delete/:ItemId", deleteItem);
export default router;
