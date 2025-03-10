const express = require("express");
const { createGame, joinGame, rollDice, getGameState } = require("../controllers/game.controller");

const router = express.Router();

router.post("/", createGame);
router.put("/:gameId/join", joinGame);
router.put("/:gameId/roll", rollDice);
router.get("/:gameId", getGameState);

module.exports = router;
