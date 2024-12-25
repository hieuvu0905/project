import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./services/config";
import { signupRouter } from "./routers/client/user/userRouter";
import { createProductRouter } from "./routers/admin/product-admin.router";

dotenv.config(); // Load biến môi trường từ .env

// Kiểm tra biến môi trường bắt buộc
if (!process.env.PORT) {
  throw new Error("PORT must be defined");
}
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI must be defined");
}

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(express.json()); // Xử lý JSON payloads

// Routes
app.use(signupRouter); // Đăng ký các routes của user
app.use(createProductRouter); // Đăng ký các routes của user

// Kết nối cơ sở dữ liệu và khởi chạy server
const startServer = async () => {
  try {
    await connectDb(); // Kết nối MongoDB
    console.clear(); // Xóa console trước khi khởi chạy

    app.listen(process.env.PORT, () => {
      console.log("Server is running on port:", process.env.PORT);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Thoát nếu xảy ra lỗi nghiêm trọng
  }
};

startServer();
