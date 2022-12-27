import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import passport from "passport";
import blogsRouter from "./routes/blogRoutes.js";
import messagesRouter from "./routes/messagesRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { signup } from "./auth/auth.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import bodyParser from "body-parser";


const loadJSON = (path) =>
    JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const swaggerDocument = loadJSON("./swagger.json");
// const swaggerDocument = loadJSON("./swagger_output.json");

const app = express();

mongoose
    .connect("mongodb://127.0.0.1:27017/my-brand", { useNewUrlParser: true })
    .then(() => {
        console.log("DB Connected");
    });
mongoose.set("strictQuery", false);
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/v1/blogs", blogsRouter);
app.use("/api/v1/messages", messagesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: err });
});

export default app;
