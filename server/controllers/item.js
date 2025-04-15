import moment from "moment";
import { db } from "../connect.js";
import fs from "fs";
import path from "path";

export const getItem = (req, res) => {
  const q =
    "SELECT id,image,name,category,unit_price,quantity,status,created_at FROM items WHERE is_delete = 0";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

// export const addItem = (req, res) => {
//   const q =
//     "INSERT INTO items (`name`,`category`,`unit_price`,`quantity`,`status`,`created_at`,`is_delete`) VALUES(?)";
//   const values = [
//     req.body.name,
//     req.body.category,
//     req.body.unit_price,
//     0,
//     req.body.status,
//     moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//     0,
//   ];
//   db.query(q, [values], (err, data) => {
//     if (err) return res.status(500).json(err);
//     res.json("Item has been created successfully!");
//   });
// };

export const addItem = (req, res) => {
  const { name, category, unit_price } = req.body;
  const quantity = 0; // Default quantity for new items

  // Determine status based on quantity
  let status;
  if (quantity === 0) status = "out of stock";
  else if (quantity < 5) status = "low stock";
  else status = "in stock";

  const image = req.file ? req.file.filename : "";

  const q = `
    INSERT INTO items 
    (image,name, category, unit_price, quantity, status, created_at, is_delete) 
    VALUES (?)
  `;
  const values = [
    image,
    name,
    category,
    unit_price,
    quantity,
    status,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    0,
  ];

  db.query(q, [values], (err) => {
    if (err) return res.status(500).json(err);
    res.status(201).json("Item created successfully!");
  });
};
export const getItemById = (req, res) => {
  const ItemId = req.params.ItemId;
  const q =
    "SELECT image,name,category,unit_price,quantity,status,created_at FROM items WHERE id = ? AND is_delete = 0";

  db.query(q, [ItemId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Item not found!");
    res.json(data[0]);
  });
};

export const updateItem = (req, res) => {
  const itemId = req.params.ItemId;

  // Get existing image
  db.query(
    "SELECT image FROM items WHERE id = ? AND is_delete = 0",
    [itemId],
    (err, [existingItem]) => {
      if (err) return res.status(500).json(err);
      if (!existingItem) return res.status(404).json("Item not found!");

      const oldImage = existingItem.image;
      const newImage = req.file ? req.file.filename : oldImage;

      // Delete old image if new uploaded, only if it's a local file (not URL)
      if (req.file && oldImage && !oldImage.startsWith("http")) {
        const imagePath = path.join("uploads/products", oldImage);
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
          else console.log("Old image deleted successfully:", oldImage);
        });
      }

      // Calculate status based on new quantity
      const quantity = parseInt(req.body.quantity) || 0;
      let status;
      if (quantity === 0) status = "out of stock";
      else if (quantity < 5) status = "low stock";
      else status = "in stock";

      const q = `
        UPDATE items SET 
          image = ? ,
          name = ?, 
          category = ?, 
          unit_price = ?, 
          quantity = ?, 
          status = ?, 
          created_at = ?
        WHERE id = ?
      `;

      const values = [
        newImage,
        req.body.name,
        req.body.category,
        req.body.unit_price,
        quantity,
        status,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        itemId,
      ];

      db.query(q, values, (err) => {
        if (err) return res.status(500).json(err);
        res.json("Item updated successfully!");
      });
    }
  );
};
export const deleteItem = (req, res) => {
  const ItemId = req.params.ItemId;
  const q = "UPDATE items SET is_delete = 1 WHERE id = ? AND is_delete = 0";

  db.query(q, [ItemId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Item has been deleted successfully!");
  });
};
