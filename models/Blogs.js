import mongoose from "mongoose";

const blogSchema = mongoose.Schema(
    {
        title: String,
        content: String,
        img: {
            type: String,
        },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        likes: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model("Blogs", blogSchema);
export default Blog;
