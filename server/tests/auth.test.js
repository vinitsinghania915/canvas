const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/User");

describe("Authentication API", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/canvas-editor-test"
    );
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up users before each test
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.code).toBe("SUCCESS");
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should not register user with duplicate email", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      // Create first user
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...userData,
          username: "testuser2",
        })
        .expect(400);

      expect(response.body.code).toBe("USER_EXISTS");
    });

    it("should not register user with duplicate username", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      // Create first user
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to create second user with same username
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...userData,
          email: "test2@example.com",
        })
        .expect(400);

      expect(response.body.code).toBe("USER_EXISTS");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({})
        .expect(400);

      expect(response.body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body.code).toBe("SUCCESS");
      expect(response.body.data.user.username).toBe("testuser");
      expect(response.body.data.token).toBeDefined();
    });

    it("should not login with invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "wrong@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body.code).toBe("INVALID_CREDENTIALS");
    });

    it("should not login with invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/auth/me", () => {
    let token;

    beforeEach(async () => {
      // Create a test user and get token
      const response = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      token = response.body.data.token;
    });

    it("should get current user with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.code).toBe("SUCCESS");
      expect(response.body.data.user.username).toBe("testuser");
      expect(response.body.data.user.email).toBe("test@example.com");
    });

    it("should not get current user without token", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body.code).toBe("UNAUTHORIZED");
    });

    it("should not get current user with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.code).toBe("UNAUTHORIZED");
    });
  });
});
