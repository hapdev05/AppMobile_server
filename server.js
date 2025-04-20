import express from "express"
import cors from "cors"
import dotenv from "dotenv"; 
dotenv.config();
const app = express();
import router from "./src/routes/auth/authRoutes.js";
import routerAdmin from "./src/routes/admin/adminRoutes.js";
import orderRoutes from "./src/routes/order/orderRoutes.js";
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the data/img directory
app.use('/data/img', express.static('src/data/img'));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the server" });
});
app.use("/api", router );
app.use("/api/admin", routerAdmin);
app.use("/api/orders", orderRoutes);

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
