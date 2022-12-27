import request from "supertest";
import app from "../index.js";
import User from "../models/Users.js";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

describe("POST /signup", () => {
    describe("Invalid email or password", () => {
        test("No user_token in response and 400 status code", async () => {
            const response = await request(app)
                .post("/api/v1/auth/signup")
                .send({ email: "admin@gmail.com", password: "Pas23" });
            expect(response.statusCode).toBe(400);
            expect(response.body).not.toHaveProperty("user_token");
            expect(response.body).toHaveProperty("error");
        });
    });
    describe("New email and a valid password", () => {
        test("200 status code, user_token in response and user in db", async () => {
            const response = await request(app)
                .post("/api/v1/auth/signup")
                .send({ email: "admin@gmail.com", password: "Pass@123" });
            const user = User.findOne({ email: "admin@gmail.com" });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("user_token");
            expect(user).toBeDefined();
        });
    });
    describe("Email that's already in use", () => {
        test("500 status code response and error message", async () => {
            const response = await request(app)
                .post("/api/v1/auth/signup")
                .send({ email: "admin@gmail.com", password: "Pass@123" });
            expect(response.statusCode).toBe(500);
            expect(response.body).toHaveProperty("error");
        });
    });
});

describe("POST /login", () => {
    describe("given valid email and valid password", () => {
        test("200 status code response", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "admin@gmail.com",
                    password: "Pass@123",
                });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("user_token");
        });
    });

    describe("given invalid email or invalid password", () => {
        test("400 status code respons, error message and no token", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "someemail@gmail.com", password: "Pass@123" });

            expect(response.statusCode).toBe(400);
            expect(response.body).not.toHaveProperty("user_token");
            expect(response.body).toHaveProperty("error");
        });
    });
});

const blog = {
    title: "Blog title",
    content: "Blog content with more details about the subject of the blog",
};
const baseDir = path.resolve("./__tests__");
describe("POST /blog", () => {
    describe("unauthenticated user", () => {
        test("403 status code and error message in response body", async () => {
            const response = await request(app)
                .post("/api/v1/blogs")
                .field(blog)
                .attach("img", `${baseDir}/test.jpg`);

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("Unauthorized request");
        });
    });
    describe("user with invalid authentication", () => {
        test("403 status code and error message in response", async () => {
            const response = await request(app)
                .post("/api/v1/blogs")
                .set("Authorization", "my token")
                .field(blog)
                .attach("img", `${baseDir}/test.jpg`);

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("Couldn't validate user");
        });
    });
    describe("user with valid authentication but invalid data", () => {
        describe("Invalid image or no image", () => {
            test("500 status code and error message", async () => {
                const response = await request(app)
                    .post("/api/v1/blogs")
                    .set("Authorization", process.env.TESTTOKEN)
                    .field(blog);

                expect(response.statusCode).toBe(500);
                expect(response.body).toHaveProperty("error");
            });
        });
        describe("Invalid title or content", () => {
            test("invalid title or content", async () => {
                const response = await request(app)
                    .post("/api/v1/blogs")
                    .set("Authorization", process.env.TESTTOKEN)
                    .field("title", "Only title")
                    .attach("img", `${baseDir}/test.jpg`);
                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty("error");
            });
        });
    });

    describe("everything is valid (authentication, image, title and content)", () => {
        test("201 status code and success message", async () => {
            const response = await request(app)
                .post("/api/v1/blogs")
                .set("Authorization", process.env.TESTTOKEN)
                .field(blog)
                .attach("img", `${baseDir}/test.jpg`);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("Blog created successfully");
        });
    });
});

const updateBlog = {
    title: "Updated title",
    content: "Edit to the content of the blog for testing",
};

describe("PATCH /blog/:id", () => {
    describe("unauthenticated user", () => {
        test("403 and error message", async () => {
            const response = await request(app)
                .patch("/api/v1/blogs/63a37159f78728558b272ded")
                .field(updateBlog)
                .attach("img", `${baseDir}/test.jpg`);
            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("Unauthorized request");
        });
    });
    describe("user with invalid authentication", () => {
        test("403 and error message", async () => {
            const response = await request(app)
                .patch("/api/v1/blogs/63a37159f78728558b272ded")
                .set("Authorization", "random token")
                .field(updateBlog)
                .attach("img", `${baseDir}/test.jpg`);

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty("error");
            expect(response.body.message).toBe("Couldn't validate user");
        });
    });
    describe("user with valid authentication but invalid data", () => {
        describe("invlaid blog id", () => {
            test("404 status and error message", async () => {
                const response = await request(app)
                    .patch("/api/v1/blogs/random_id")
                    .set("Authorization", process.env.TESTTOKEN)
                    .field(updateBlog)
                    .attach("img", `${baseDir}/test.jpg`);

                expect(response.statusCode).toBe(404);
                expect(response.body.message).toBe("Blog not found");
            });
        });
        describe("invalid data", () => {
            let blogId = "";
            beforeEach(async () => {
                const response = await request(app).get("/api/v1/blogs/");
                blogId = response.body.blog_list[0]._id;
            });
            test("400 status code and error message", async () => {
                const response = await request(app)
                    .patch(`/api/v1/blogs/${blogId}`)
                    .set("Authorization", process.env.TESTTOKEN);

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty("error");
            });
        });
    });
});

describe("GET /blogs", () => {
    describe("blogs list", () => {
        test("200 status code and blogs array", async () => {
            const response = await request(app).get("/api/v1/blogs");

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("blog_list");
        });
    });
    describe("blog details", () => {
        describe("with invalid id", () => {
            test("404 status and error message", async () => {
                const response = await request(app).get(
                    "/api/v1/blogs/63a37159f78728558"
                );

                expect(response.statusCode).toBe(404);
                expect(response.body).toHaveProperty("error");
                expect(response.body.message).toBe("Blog not found");
            });
        });

        describe("with valid id", () => {
            let blogId = "";
            beforeEach(async () => {
                const response = await request(app).get("/api/v1/blogs/");
                blogId = response.body.blog_list[0]._id;
            });
            test("200 status and blog details in response", async () => {
                const response = await request(app).get(
                    "/api/v1/blogs/63a37159f78728558b272ded"
                );

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty("blog");
            });
        });
    });
});

describe("POST /blog/:id/comment", () => {
    describe("Wrong blog id", () => {
        test("400 status code and error message response", async () => {
            const response = await request(app)
                .post("/api/v1/blogs/63a37159f787285b272ded/comments")
                .send({
                    author: "Irakoze",
                    message: "Hi, How are you doing?",
                });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error");
        });
    });
    describe("Valid blog and valid data (author & message)", () => {
        let blogId = "";
        beforeEach(async () => {
            const response = await request(app).get("/api/v1/blogs/");
            blogId = response.body.blog_list[0]._id;
        });
        test("200 status code and message", async () => {
            const response = await request(app)
                .post(`/api/v1/blogs/${blogId}/comments`)
                .send({
                    author: "Irakoze",
                    message: "Hi, How are you doing?",
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.comment).toBeDefined();
        });
    });
    describe("Valid blog but invalid data (author & message)", () => {
        let blogId = "";
        beforeEach(async () => {
            const response = await request(app).get("/api/v1/blogs/");
            blogId = response.body.blog_list[0]._id;
        });
        test("comment not in response", async () => {
            const response = await request(app)
                .post(`/api/v1/blogs/${blogId}/comments`)
                .send({
                    author: "Irakoze Yves Tony Kwizera Enseignant",
                    message: "Hi, How are you doing?",
                });
            expect(response.body.comment).not.toBeDefined();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });
});

describe("GET /blog/:id/comment", () => {
    describe("Wrong blog id", () => {
        test("400 status code and error message response", async () => {
            const response = await request(app).get(
                "/api/v1/blogs/63a37159f78728/comments"
            );

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("valid blog id", () => {
        let blogId = "";
        beforeEach(async () => {
            const response = await request(app).get("/api/v1/blogs/");
            blogId = response.body.blog_list[0]._id;
        });
        test("200 status code and comments array", async () => {
            const response = await request(app).get(
                `/api/v1/blogs/${blogId}/comments`
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("comments");
        });
    });
});

describe("POST /blog:id/like", () => {
    describe("Wrong blog id", () => {
        test("400 status code and error message response", async () => {
            const response = await request(app)
                .post("/api/v1/blogs/7635553832/like")
                .send();

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("Valid blog id", () => {
        let blogId = "";
        beforeEach(async () => {
            const response = await request(app).get("/api/v1/blogs/");
            blogId = response.body.blog_list[0]._id;
        });
        test("200 status and new likes count", async () => {
            const response = await request(app)
                .post(`/api/v1/blogs/${blogId}/like`)
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("likes");
        });
    });
});

describe("GET /blog:id/like", () => {
    describe("Wrong blog id", () => {
        test("400 status code and error message response", async () => {
            const response = await request(app).get(
                "/api/v1/blogs/9377643/like"
            );

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("valid blog id", () => {
        let blogId = "";
        beforeEach(async () => {
            const response = await request(app).get("/api/v1/blogs/");
            blogId = response.body.blog_list[0]._id;
        });
        test("200 status and likes count", async () => {
            const response = await request(app).post(
                `/api/v1/blogs/${blogId}/like`
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("likes");
        });
    });
});

describe("POST /messages", () => {
    describe("with incomplete data", () => {
        test("400 status code and error response", async () => {
            const response = await request(app).post("/api/v1/messages").send({
                mail: "irakozeyves9@gmail.com",
                message: "Hello",
            });
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });
    describe("with complete data", () => {
        test("201 status code and message in response", async () => {
            const response = await request(app).post("/api/v1/messages").send({
                first_name: "Irakoze",
                last_name: "Yves",
                mail: "irakoze@gmail.com",
                message: "Something I've got to say at any cost",
            });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("message");
        });
    });
});

describe("GET /messages", () => {
    describe("without authorization", () => {
        test("403 status code and no messages in response", async () => {
            const response = await request(app).get("/api/v1/messages");

            expect(response.statusCode).toBe(403);
            expect(response.body.error).toBeDefined();
            expect(response.body).not.toHaveProperty("messages");
        });
    });
    describe("with invalid authorization", () => {
        test("403 status code and no messages in response", async () => {
            const response = await request(app)
                .get("/api/v1/messages")
                .set("Authorization", "Random token");

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty("error");
            expect(response.body.messages).not.toBeDefined();
        });
    });
    describe("with valid authorization", () => {
        test("200 status code and messages array in response", async () => {
            const response = await request(app)
                .get("/api/v1/messages")
                .set("Authorization", process.env.TESTTOKEN);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("messages");
        });
    });
});

describe("GET /messages/:id", () => {
    describe("without authorization", () => {
        test("403 status code and no message in response", async () => {
            const response = await request(app).get(
                "/api/v1/messages/63a4cdae3cd5b8b3b7254ea8"
            );

            expect(response.statusCode).toBe(403);
            expect(response.body.error).toBeDefined();
            expect(response.body).not.toHaveProperty("messages");
        });
    });
    describe("with invalid authorization", () => {
        test("403 status code and no message in response", async () => {
            const response = await request(app)
                .get("/api/v1/messages/63a4cdae3cd5b8b3b7254ea8")
                .set("Authorization", "Random token");

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty("error");
        });
    });
    describe("with valid authorization", () => {
        describe("with invalid message id", () => {
            test("404 status code with error", async () => {
                const response = await request(app)
                    .get("/api/v1/messages/63a4cdae3cd5b8")
                    .set("Authorization", process.env.TESTTOKEN);

                expect(response.statusCode).toBe(404);
                expect(response.body.error).toBeDefined();
            });
        });
        describe("with valid message id", () => {
            let messageId = "";
            beforeEach(async () => {
                const response = await request(app)
                    .get("/api/v1/messages")
                    .set("Authorization", process.env.TESTTOKEN);
                messageId = response.body.messages[0]._id;
            });
            test("200 status code and message in response", async () => {
                const response = await request(app)
                    .get(`/api/v1/messages/${messageId}`)
                    .set("Authorization", process.env.TESTTOKEN);

                expect(response.statusCode).toBe(200);
                expect(response.body.message).toBeDefined();
            });
        });
    });
});

describe("DELETE /messages/:id", () => {
    describe("without authorization", () => {
        test("403 status code and no message in response", async () => {
            const response = await request(app).delete(
                "/api/v1/messages/63a4cdae3cd5b8b3b7254ea8"
            );

            expect(response.statusCode).toBe(403);
            expect(response.body.error).toBeDefined();
        });
    });
    describe("with invalid authorization", () => {
        test("403 status code and no message in response", async () => {
            const response = await request(app)
                .delete("/api/v1/messages/63a4cdae3cd5b8b3b7254ea8")
                .set("Authorization", "Random token");

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty("error");
        });
    });
    describe("with valid authorization", () => {
        describe("with invalid message id", () => {
            test("404 status code with error", async () => {
                const response = await request(app)
                    .delete("/api/v1/messages/63a4c9388ab4790841")
                    .set("Authorization", process.env.TESTTOKEN);
                expect(response.statusCode).toBe(404);
                expect(response.body.error).toBeDefined();
            });
        });
        describe("with valid message id", () => {
            let messageId = "";
            beforeEach(async () => {
                const response = await request(app)
                    .get("/api/v1/messages")
                    .set("Authorization", process.env.TESTTOKEN);
                messageId = response.body.messages[0]._id;
            });
            test("200 status code and message in response", async () => {
                const response = await request(app)
                    .delete(`/api/v1/messages/${messageId}`)
                    .set("Authorization", process.env.TESTTOKEN);

                expect(response.statusCode).toBe(200);
                expect(response.body.message).toBeDefined();
            });
        });
    });
});

describe("DELETE /blog/:id", () => {
    describe("with invalid id", () => {
        test("404 status code and blog not found error message", async () => {
            const response = await request(app).delete(
                "/api/v1/blogs/63a4c9388ab4790841"
            );

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("error");
            expect(response.body.message).toBe("Blog not found");
        });
    });
    describe("with valid id", () => {
        let blogId = "";
        beforeEach(async () => {
            const response = await request(app).get("/api/v1/blogs/");
            blogId = response.body.blog_list[0]._id;
        });
        test("200 status code and deleted successfully message", async () => {
            const response = await request(app).delete(
                `/api/v1/blogs/${blogId}`
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Deleted Successfully");
        });
    });
});

async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany();
    }
}

afterAll(async () => {
    try {
        await removeAllCollections();
        await mongoose.connection.close();
    } catch (err) {
        console.log(`${err}`);
        throw err;
    }
});
