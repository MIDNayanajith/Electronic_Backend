import multer from "multer";
import path from "path";
import fs from "fs";

// Create directories if they don't exist
const userDir = "uploads/user";
const productDir = "uploads/products";

[userDir, productDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for user images
const storageUser = multer.diskStorage({
  destination: (req, file, cb) => cb(null, userDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// Storage for product images
const storageProduct = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype.startsWith("image/")
    ? cb(null, true)
    : cb(new Error("Only images are allowed!"), false);
};

export const uploadUser = multer({ storage: storageUser, fileFilter });
export const uploadProduct = multer({ storage: storageProduct, fileFilter });
