import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import passport from "passport";
import blogsRouter from "./routes/blogRoutes.js";
import messagesRouter from "./routes/messagesRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { signup } from "./auth/auth.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

mongoose
    .connect("mongodb://127.0.0.1:27017/my-brand", { useNewUrlParser: true })
    .then(() => {
        console.log("DB Connected");
    });
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/blogs", blogsRouter);
app.use("/api/v1/messages", messagesRouter);
app.use("/api/v1/auth", authRouter);

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: err });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
