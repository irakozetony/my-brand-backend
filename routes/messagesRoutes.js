import express from "express";
import { authenticate } from "../auth/auth.js";

import {
    message_create,
    message_list,
    message_delete,
    message_details,
} from "../controllers/messageController.js";
import messageValidation from "../validations/messageValidator.js";

const messagesRouter = express.Router();

messagesRouter.post("/", messageValidation, message_create);
messagesRouter.get("/", authenticate, message_list);
messagesRouter.get("/:id", authenticate, message_details);
messagesRouter.delete("/:id", authenticate, message_delete);

export default messagesRouter;
