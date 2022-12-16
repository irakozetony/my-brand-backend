import Comment from "../models/Comments.js";
import Blog from "../models/Blogs.js";

export const comment_create = (req, res) => {
    const blogId = req.params.id;
    const comment = new Comment({
        author: req.body.author,
        message: req.body.message,
        blog_id: blogId,
    });
    const blog = Blog.findOne(blogId);
    if (blog) {
        comment
            .save()
            .then(async (data) => {
                await Blog.findByIdAndUpdate(blogId, {
                    $push: { comments: data._id },
                });
                return res.status(200).json({ comment: data });
            })
            .catch((err) =>
                res
                    .status(400)
                    .json({ error: err, message: "Comment not added" })
            );
    } else return res.status(400).json({ error: "Blog not found" });
};

export const comment_list = (req, res) => {
    const blogId = req.params.id;
    Blog.findOne({ _id: blogId })
        .then(async (blog) => {
            const comments = [];
            const blogComments = blog.comments;
            for (let i = 0; i < blogComments.length; i++) {
                const blogComment = await Comment.findById(blogComments[i]);
                comments.push(blogComment);
            }
            res.status(200).json({ comments: comments });
        })
        .catch((err) => res.status(400).json({ error: err }));
};
