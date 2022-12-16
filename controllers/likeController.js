import Blog from "../models/Blogs.js";

export const like = (req, res) => {
    const blogId = req.params.id;
    const blog = Blog.findOne(blogId);
    if (blog) {
        Blog.findByIdAndUpdate(blogId, { $inc: { likes: 1 } })
            .then((data) =>
                res
                    .status(200)
                    .json({ message: "Like added", likes: data.likes + 1 })
            )
            .catch((err) =>
                res.status(400).json({ error: err, message: "Like not added" })
            );
    } else return res.status(400).json({ error: "Blog not found" });
};

export const likes_count = (req, res) => {
    const blogId = req.params.id;
    const blog = Blog.findOne(blogId);
    if (blog) {
        Blog.findOne({ _id: blogId })
            .then((blog) => res.status(200).json({ likes: blog.likes }))
            .catch((err) =>
                res.status(400).json({
                    error: err,
                    message: "Couldn't retrieve likes count",
                })
            );
    } else return res.status(400).json({ error: "Blog not found" });
};
export const unlike = (req, res) => {
    let blogId = req.params.id;
    const blog = Blog.findOne(blogId);
    if (blog) {
        if(blog.likes == 0){
            return res.status(400).json({error: "Can't unlike"});
        }
        Blog.findByIdAndUpdate(blogId, { $inc: { likes: -1 } })
            .then((data) =>
                res.status(200).json({ message: "Like removed", likes: data.likes - 1 })
            )
            .catch((err) =>
                res.status(400).json({ error: err, message: "Like not removed" })
            );
    }
};
