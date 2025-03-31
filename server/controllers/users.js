import moment from "moment";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";
export const getUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    // Ensure correct secret key
    if (err) return res.status(403).json("Invalid Token!");

    const q =
      "SELECT id, first_name, last_name, profile, email, role, created_at FROM users WHERE is_delete = 0";

    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      res.json(data);
    });
  });
};

export const getUserById = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Invalid Token!");

    const userId = req.params.userId;
    const q =
      "SELECT id, first_name, last_name, profile, email, role, created_at FROM users WHERE id = ? AND is_delete = 0";

    db.query(q, [userId], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(404).json("User not found!");

      res.json(data[0]);
    });
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged In!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Invalid Token!");

    const userId = req.params.userId;

    const q =
      "UPDATE users SET first_name =?, last_name =?, profile =?, email =?,created_at=? WHERE id =? AND is_delete = 0";

    const values = [
      req.body.first_name,
      req.body.last_name,
      req.body.profile,
      req.body.email,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userId,
    ];
    db.query(q, [...values, userId], (err, data) => {
      if (err) return res.status(500).json(err);
      res.json("User has been updated successfully!");
    });
  });
};

export const deleteUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged In!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Invalid Token!");

    const userId = req.params.userId;
    const q = "UPDATE users SET is_delete = 1 WHERE id = ? AND is_delete = 0";

    db.query(q, [userId], (err, data) => {
      if (err) return res.status(500).json(err);
      res.json("User has been deleted successfully!");
    });
  });
};
