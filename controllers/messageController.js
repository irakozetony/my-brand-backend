import Message from "../models/Messages.js";

export const message_create = (req, res) => {
    const message = new Message({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        mail: req.body.mail,
        phone: req.body.phone,
        message: req.body.message,
    });
    message
        .save()
        .then((data) => res.status(201).json({ message: data }))
        .catch((err) => res.status(400).json({ error: err }));
};

export const message_list = (req, res) => {
    Message.find()
        .then((message_list) =>
            res.status(200).json({ messages: message_list })
        )
        .catch((err) =>
            res.status(404).json({ error: err, message: "No messages found" })
        );
};

export const message_details = (req, res) => {
    const id = req.params.id;
    Message.findById(id)
        .then((message) => {
            if (!message)
                return res.status(404).json({ error: "Message not found" });
            return res.status(200).json({ message: message });
        })
        .catch((err) =>
            res.status(404).json({ error: err, message: "Message not found" })
        );
};

export const message_delete = (req, res) => {
    const id = req.params.id;
    Message.findByIdAndDelete(id)
        .then((result) =>
            res
                .status(200)
                .json({ message: result, message: "Deleted Successfully" })
        )
        .catch((err) => {
            res.status(404).json({ error: err, message: "Delete failed" });
        });
};
