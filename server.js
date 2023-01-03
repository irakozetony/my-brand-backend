import app from "./index.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
