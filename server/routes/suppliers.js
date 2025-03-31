import express from "express";
import {
  getSuppliers,
  addSuppliers,
  getById,
  updateSup,
  deleteSup,
} from "../controllers/suppliers.js";
const router = express.Router();

router.get("/getSuppliers", getSuppliers);
router.post("/addSuppliers", addSuppliers);
router.get("/find/:SupId", getById);
router.put("/update/:SupId", updateSup);
router.delete("/delete/:SupId", deleteSup);
export default router;
