import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

// Load biến môi trường từ .env
dotenv.config();

// Đọc JSON bằng fs.readFileSync
const serviceAccount = JSON.parse(fs.readFileSync("./src/config/firebaseServiceAccountKey.json", "utf8"));

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dacs-8ba7d-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const auth = admin.auth();
const db = admin.database();

export { db, auth };
export default admin;
