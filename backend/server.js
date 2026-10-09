import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);

const start = async () => {
  try {
    await mongoose.connect("mongodb+srv://kaifthehero133_db_user:g0l5iJXFlQRvT5pZ@cluster0.aqowmjk.mongodb.net/?appName=Cluster0");
    app.listen(9090, () => {
      console.log("Server on 9090");
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
start();
