import express from "express";
import {
    blog_create,
    blog_list,
    upload,
    blog_details,
    blog_update,
    blog_delete,
} from "../controllers/blogController.js";
import {
    comment_create,
    comment_list,
} from "../controllers/commentController.js";
import { like, likes_count, unlike } from "../controllers/likeController.js";
import commentValidation from "../validations/commentValidator.js";
import blogValidation from "../validations/blogValidator.js";
import { authenticate } from "../auth/auth.js";

const blogsRouter = express.Router();

blogsRouter.get("/", blog_list);
blogsRouter.get("/:id", blog_details);
blogsRouter.post(
    "/",
    authenticate,
    upload.single("img"),
    blogValidation,
    blog_create
);
blogsRouter.patch(
    "/:id",
    authenticate,
    upload.single("img"),
    blogValidation,
    blog_update
);
blogsRouter.delete("/:id", blog_delete);

blogsRouter.post("/:id/comments", commentValidation, comment_create);
blogsRouter.get("/:id/comments", comment_list);

blogsRouter.post("/:id/like", like);
blogsRouter.get("/:id/like", likes_count);
blogsRouter.post("/:id/unlike", unlike);

export default blogsRouter;
