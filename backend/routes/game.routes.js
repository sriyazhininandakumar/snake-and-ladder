const express = require("express");
const { createGame, joinGame, rollDice, getGameState } = require("../controllers/game.controller");
const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", createGame);
router.put("/:gameId/join",joinGame);
router.get("/:gameId", getGameState);

module.exports = router;
