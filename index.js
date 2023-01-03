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
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const loadJSON = (path) =>
    JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const swaggerDocument = loadJSON("./swagger.json");
// const swaggerDocument = loadJSON("./swagger_output.json");

const app = express();

let dbURI = "";
if (process.env.NODE_ENV == "test" || !process.env.NODE_ENV) {
    dbURI = "mongodb://127.0.0.1:27017/my-brand";
} else {
    dbURI = `mongodb+srv://kiytony:${process.env.ATLAS_PASSWORD}@my-brand-backend.9jvdikp.mongodb.net/my-brand?retryWrites=true&w=majority`;
}

mongoose
    .connect(dbURI, { useNewUrlParser: true })
    .then(() => {
        console.log("DB Connected");
    })
    .catch((err) => console.log("error: " + err + " DB Connection failed"));

mongoose.set("strictQuery", false);

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use("/api/v1/blogs", cors(),  blogsRouter);
app.use("/api/v1/messages", cors(), messagesRouter);
app.use("/api/v1/auth", cors(), authRouter);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/", cors(), (req, res) => {
    res.send("Go to /api/v1/docs to see documentation");
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: err });
});

export default app;
