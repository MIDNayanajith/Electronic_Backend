import moment from "moment";
import { db } from "../connect.js";

export const getItem = (req, res) => {
  const q =
    "SELECT id,name,category,unit_price,quantity,status,created_at FROM items WHERE is_delete = 0";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const addItem = (req, res) => {
  const q =
    "INSERT INTO items (`name`,`category`,`unit_price`,`quantity`,`status`,`created_at`,`is_delete`) VALUES(?)";
  const values = [
    req.body.name,
    req.body.category,
    req.body.unit_price,
    req.body.quantity,
    req.body.status,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    0,
  ];
  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Item has been created successfully!");
  });
};

export const getItemById = (req, res) => {
  const ItemId = req.params.ItemId;
  const q =
    "SELECT name,category,unit_price,quantity,status,created_at FROM items WHERE id = ? AND is_delete = 0";

  db.query(q, [ItemId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Item not found!");
    res.json(data[0]);
  });
};

export const updateItem = (req, res) => {
  const ItemId = req.params.ItemId;

  const q =
    "UPDATE items SET name =? ,category =?,unit_price=?,quantity=?, status =? ,created_at=? WHERE id = ? AND is_delete = 0";

  const values = [
    req.body.name,
    req.body.category,
    req.body.unit_price,
    req.body.quantity,
    req.body.status,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ItemId,
  ];
  db.query(q, [...values, ItemId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Item has been updated successfully!");
  });
};

export const deleteItem = (req, res) => {
  const ItemId = req.params.ItemId;
  const q = "UPDATE items SET is_delete = 1 WHERE id = ? AND is_delete = 0";

  db.query(q, [ItemId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Item has been deleted successfully!");
  });
};
