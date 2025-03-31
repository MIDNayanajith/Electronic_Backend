import moment from "moment";
import { db } from "../connect.js";

export const getSuppliers = (req, res) => {
  const q =
    "SELECT id,name,contact,email,address,created_at FROM suppliers WHERE is_delete =0";

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const addSuppliers = (req, res) => {
  const q =
    "INSERT INTO suppliers (`name`,`contact`,`email`,`address`,`created_at`,`is_delete`) VALUES(?)";
  const values = [
    req.body.name,
    req.body.contact,
    req.body.email,
    req.body.address,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    0,
  ];
  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Supplier has been created successfully!");
  });
};

export const getById = (req, res) => {
  const SupId = req.params.SupId;
  const q =
    "SELECT name,contact,email,address,created_at FROM suppliers WHERE id = ? AND is_delete = 0";

  db.query(q, [SupId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Supplier not found!");
    res.json(data[0]);
  });
};

export const updateSup = (req, res) => {
  const SupId = req.params.SupId;

  const q =
    "UPDATE suppliers SET name =?,contact =?,email=?,address =?,created_at=? WHERE id = ? AND is_delete = 0";

  const values = [
    req.body.name,
    req.body.contact,
    req.body.email,
    req.body.address,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    SupId,
  ];
  db.query(q, [...values, SupId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Supplier has been updated successfully!");
  });
};

export const deleteSup = (req, res) => {
  const SupId = req.params.SupId;
  const q = "UPDATE suppliers SET is_delete = 1 WHERE id = ? AND is_delete = 0";

  db.query(q, [SupId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Supplier has been deleted successfully!");
  });
};
