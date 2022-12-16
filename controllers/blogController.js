import Blog from "../models/Blogs.js";
import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(new Error("File type not supported"), false);
    }
};
export const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: fileFilter,
});

export const blog_create = (req, res) => {
    const blog = new Blog({
        title: req.body.title,
        content: req.body.content,
        img: req.file.path,
    });
    blog.save()
        .then((data) =>
            res
                .status(201)
                .json({ blog: data, message: "Blog created successfully" })
        )
        .catch((err) =>
            res.status(400).json({ error: err, message: "Blog not created" })
        );
};

export const blog_list = (req, res) => {
    Blog.find()
        .then((blog_list) => res.status(200).json({blog_list: blog_list}))
        .catch((err) => res.status(400).json({ error: err }));
};
export const blog_details = (req, res) => {
    const id = req.params.id;
    Blog.findById(id)
        .then((blog) => res.status(200).json({blog: blog}))
        .catch((err) => res.status(404).json({ error: err, message: "Blog not found" }));
};
export const blog_update = (req, res) => {
    const id = req.params.id;
    Blog.findById(id)
        .then((blog) => {
            if (req.body.title) blog.title = req.body.title;
            if (req.body.content) blog.content = req.body.content;
            if (req.file) blog.img = req.file.path;

            blog.save()
                .then((blog) => res.status(200).json({ blog: blog }))
                .catch((err) =>
                    res
                        .status(400)
                        .json({ error: err, message: "Blog update failed" })
                );
        })
        .catch((err) =>
            res.status(404).json({
                error: err,
                message: "Blog not found",
            })
        );
};
export const blog_delete = (req, res) => {
    const id = req.params.id;
    Blog.findByIdAndDelete(id)
        .then((result) =>
            res.status(200).json({ blog: result, message: "Deleted Successfully" })
        )
        .catch((err) => res.status(404).json({ error: err, message: "Blog not found" }));
};
