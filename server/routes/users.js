import express from "express";
import {
  getUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.js";
const router = express.Router();

router.get("/getUser", getUser);
router.get("/find/:userId", getUserById);
router.put("/update/:userId", updateUser);
router.delete("/delete/:userId", deleteUser);
export default router;
