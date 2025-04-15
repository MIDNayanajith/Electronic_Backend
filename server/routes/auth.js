import express from "express";
import { login, logout, register } from "../controllers/auth.js";
import { uploadUser } from "../upload.js";

const router = express.Router();

router.post("/register", uploadUser.single("profile"), register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
