import express from "express";
import {
  getItem,
  addItem,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/item.js";
const router = express.Router();

router.get("/getItem", getItem);
router.post("/addItem", addItem);
router.get("/find/:ItemId", getItemById);
router.put("/update/:ItemId", updateItem);
router.delete("/delete/:ItemId", deleteItem);
export default router;
