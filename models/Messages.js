import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        mail: {
            type: String,
        },
        phone: {
            type: String,
        },
        message: { type: String },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
