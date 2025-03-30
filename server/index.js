import express from "express";
import userRoutes from "./routes/users.js";
import authRouts from "./routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.listen(8800, () => {
  console.log("Server is running!");
});

//middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRouts);
