import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/routes.js";
import cookieParser from "cookie-parser";
// import cloudinaryRoutes from "./routes/cloudinaryRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("mongoose connected!"))
    .catch(err=>console.log(err))

// console.log(process.env.MONGO_URI)

const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
// app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req,res)=>{
    res.send("server running successfully!");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`server running on PORT http://localhost:${PORT}`);
})
