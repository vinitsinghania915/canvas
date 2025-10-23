const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/User");
const Design = require("../models/Design");

describe("Designs API", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/canvas-editor-test"
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Design.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Design.deleteMany({});

    // Create test user and get token
    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    token = response.body.data.token;
    userId = response.body.data.user.id;
  });

  describe("POST /api/designs", () => {
    it("should create a new design", async () => {
      const designData = {
        name: "Test Design",
        description: "A test design",
        canvas: {
          width: 1080,
          height: 1080,
          backgroundColor: "#ffffff",
        },
      };

      const response = await request(app)
        .post("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .send(designData)
        .expect(201);

      expect(response.body.code).toBe("SUCCESS");
      expect(response.body.data.design.name).toBe(designData.name);
      expect(response.body.data.design.description).toBe(
        designData.description
      );
      expect(response.body.data.design.owner.id).toBe(userId);
    });

    it("should create design with default canvas size", async () => {
      const designData = {
        name: "Test Design",
      };

      const response = await request(app)
        .post("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .send(designData)
        .expect(201);

      expect(response.body.data.design.canvas.width).toBe(1080);
      expect(response.body.data.design.canvas.height).toBe(1080);
      expect(response.body.data.design.canvas.backgroundColor).toBe("#ffffff");
    });

    it("should not create design without authentication", async () => {
      const designData = {
        name: "Test Design",
      };

      const response = await request(app)
        .post("/api/designs")
        .send(designData)
        .expect(401);

      expect(response.body.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/designs", () => {
    beforeEach(async () => {
      // Create test designs
      await request(app)
        .post("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Design 1" });

      await request(app)
        .post("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Design 2" });
    });

    it("should get user designs", async () => {
      const response = await request(app)
        .get("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.code).toBe("SUCCESS");
      expect(response.body.data.designs).toHaveLength(2);
    });

    it("should not get designs without authentication", async () => {
      const response = await request(app).get("/api/designs").expect(401);

      expect(response.body.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/designs/:id", () => {
    let designId;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Design",
          canvas: {
            width: 1080,
            height: 1080,
            backgroundColor: "#ffffff",
          },
          objects: [
            {
              id: "obj1",
              type: "text",
              text: "Hello World",
              left: 100,
              top: 100,
              width: 200,
              height: 50,
              angle: 0,
              scaleX: 1,
              scaleY: 1,
              zIndex: 0,
            },
          ],
        });

      designId = response.body.data.design._id;
    });

    it("should get specific design", async () => {
      const response = await request(app)
        .get(`/api/designs/${designId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.code).toBe("SUCCESS");
      expect(response.body.data.design._id).toBe(designId);
      expect(response.body.data.design.objects).toHaveLength(1);
    });

    it("should not get non-existent design", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/designs/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.code).toBe("DESIGN_NOT_FOUND");
    });
  });

  describe("PUT /api/designs/:id", () => {
    let designId;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Design",
          canvas: {
            width: 1080,
            height: 1080,
            backgroundColor: "#ffffff",
          },
          objects: [],
        });

      designId = response.body.data.design._id;
    });

    it("should update design", async () => {
      const updateData = {
        name: "Updated Design",
        objects: [
          {
            id: "obj1",
            type: "text",
            text: "Updated Text",
            left: 200,
            top: 200,
            width: 300,
            height: 100,
            angle: 0,
            scaleX: 1,
            scaleY: 1,
            zIndex: 0,
          },
        ],
      };

      const response = await request(app)
        .put(`/api/designs/${designId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.code).toBe("SUCCESS");
      expect(response.body.data.design.name).toBe("Updated Design");
      expect(response.body.data.design.objects).toHaveLength(1);
      expect(response.body.data.design.objects[0].text).toBe("Updated Text");
    });

    it("should not update non-existent design", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/designs/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Design" })
        .expect(404);

      expect(response.body.code).toBe("DESIGN_NOT_FOUND");
    });
  });

  describe("DELETE /api/designs/:id", () => {
    let designId;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/designs")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Design" });

      designId = response.body.data.design._id;
    });

    it("should delete design", async () => {
      const response = await request(app)
        .delete(`/api/designs/${designId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.code).toBe("SUCCESS");

      // Verify design is deleted
      const getResponse = await request(app)
        .get(`/api/designs/${designId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(getResponse.body.code).toBe("DESIGN_NOT_FOUND");
    });

    it("should not delete non-existent design", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/designs/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.code).toBe("DESIGN_NOT_FOUND");
    });
  });
});
