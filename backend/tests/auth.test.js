const request = require("supertest");
const app = require("../app"); // Make sure this points to your Express app

let authToken; // Store authentication token

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login") // Adjust this based on your auth route
    .send({ email: "test@example.com", password: "password123" });

  authToken = res.body.token; // Assuming the response includes a token
});

test("should create a game", async () => {
  const res = await request(app)
    .post("/api/game")
    .set("Authorization", `Bearer ${authToken}`) // Add this line
    .send({ userid: "1" })
    .expect(201);

  expect(res.body.gameId).toBeDefined();
  expect(res.body.joinUrl).toBeDefined();
});
