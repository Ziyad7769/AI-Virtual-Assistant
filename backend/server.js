import connectDB from "./config/db.js";
import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://virtual-assistant-fgs2.onrender.com",
];

app.use(
  cors({
<<<<<<< HEAD
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
=======
    origin: "http://localhost:5173, https://virtual-assistant-fgs2.onrender.com",
>>>>>>> 4ae3ff273b7bcf2567ff60f2b59fdfcd0c744b4a
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);



app.listen(port, () => {
  connectDB();
  console.log("server started");
});
