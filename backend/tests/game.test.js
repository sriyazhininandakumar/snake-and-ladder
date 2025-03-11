const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.json());


let games = {};
let gameCounter = 1;
const winningPosition = 100;


app.post("/api/game", (req, res) => {
  const { userid } = req.body;
  if (!userid) return res.status(400).json({ message: "User ID is required" });

  const gameId = gameCounter++;
  games[gameId] = { gameid: gameId, players: [userid], gameState: {} };

  res.status(201).json({ gameId, joinUrl: `/api/game/${gameId}/join` });
});

// Join a game
app.put("/api/game/:gameId/join", (req, res) => {
  const { gameId } = req.params;
  const { userid } = req.body;
  
  if (!games[gameId]) return res.status(404).json({ message: "Game not found" });
  if (!userid) return res.status(400).json({ message: "User ID is required" });

  games[gameId].players.push(userid);
  res.status(200).json({ message: "Joined game successfully", game: games[gameId] });
});

// Roll Dice
app.put("/api/game/:gameId/roll", (req, res) => {
  const { gameId } = req.params;
  const { userid } = req.body;
  
  if (!games[gameId]) return res.status(404).json({ message: "Game not found" });
  if (!games[gameId].players.includes(userid)) return res.status(403).json({ message: "User not in game" });

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  const newPosition = (games[gameId].gameState[userid] || 0) + diceRoll;
  games[gameId].gameState[userid] = newPosition;

  let winner = null;
  if (newPosition >= winningPosition) {
    winner = userid;
  }

  res.status(200).json({ diceRoll, newPosition, winner });
});

// Supertest Tests
describe("Game API Endpoints (No Database)", () => {
  let gameId;
  
  it("should create a game", async () => {
    const res = await request(app)
      .post("/api/game")
      .send({ userid: "1" })
      .expect(201);

    expect(res.body.gameId).toBeDefined();
    gameId = res.body.gameId;
  });

  it("should allow another user to join the game", async () => {
    const res = await request(app)
      .put(`/api/game/${gameId}/join`)
      .send({ userid: "4" })
      .expect(200);

    expect(res.body.message).toBe("Joined game successfully");
    expect(res.body.game.players.length).toBeGreaterThan(1);
  });

  it("should roll the dice for the player and determine winner if applicable", async () => {
    const res = await request(app)
      .put(`/api/game/${gameId}/roll`)
      .send({ userid: "1" })
      .expect(200);

    expect(res.body.diceRoll).toBeGreaterThanOrEqual(1);
    expect(res.body.diceRoll).toBeLessThanOrEqual(6);
    expect(res.body.newPosition).toBeDefined();
    if (res.body.winner) {
      expect(res.body.winner).toBe("1");
    }
  });
});
