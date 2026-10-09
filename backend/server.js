import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

// Loads .env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9090;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);
app.use(express.static("uploads"));

const start = async () => {
  let connected = false;
  while (!connected) {
    try {
      if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined in .env file");
      }
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB");
      connected = true;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Connection failed, retrying in 3s...", error.message);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};
start();