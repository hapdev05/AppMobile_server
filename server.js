import express from "express"
import cors from "cors"
import dotenv from "dotenv"; 
dotenv.config();
const app = express();
import router from "./src/routes/auth/authRoutes.js";;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the server" });
});
app.use("/api", router );

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
