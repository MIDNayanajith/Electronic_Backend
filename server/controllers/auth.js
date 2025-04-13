import moment from "moment/moment.js";
import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//register controller function
export const register = (req, res) => {
  // Check if the logged-in user is an admin
  const q = "SELECT role FROM users WHERE id = ?";
  db.query(q, [req.body.id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User Already Exists!");

    //HASH PASSWORD
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q =
      "INSERT INTO users (`first_name`, `last_name`, `profile`,`email`,`password`,`role`,`created_at`,`is_delete`) VALUE(?)";

    const values = [
      req.body.first_name,
      req.body.last_name,
      req.file ? req.file.filename : "", // image filename
      req.body.email,
      hashedPassword,
      req.body.role,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      0,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created Successfully!");
    });
  });
};
//login controller function
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE email =?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json("Incorrect Email or Password");

    const checkedPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    if (!checkedPassword)
      return res.status(401).json("Incorrect Email or Password");

    const token = jwt.sign({ id: data[0].id }, "secretkey");

    const { password, ...others } = data[0];
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .json(others);
  });
};

//login controller function
export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("User has been logged out");
};
