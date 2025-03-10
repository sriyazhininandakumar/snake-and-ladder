const gameService = require("../services/game.services");

// ✅ Create a new game
const createGame = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { userid } = req.body;

    if (!userid) {
      return res.status(400).json({ message: "userid is required" });
    }

    const game = await gameService.createGame(userid);
    res.status(201).json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Error creating game", error: error.message });
  }
};

// ✅ Join a game
const joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userid } = req.body;

    const game = await gameService.joinGame(gameId, userid);
    res.json({ message: "Joined game successfully", game });
  } catch (error) {
    console.error("Error joining game:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Roll dice
const rollDice = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userid } = req.body;

    const result = await gameService.rollDice(gameId, userid);
    res.json(result);
  } catch (error) {
    console.error("Error rolling dice:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get game state
const getGameState = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameState = await gameService.getGameState(gameId);
    res.json(gameState);
  } catch (error) {
    console.error("Error fetching game state:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGame, joinGame, rollDice, getGameState };
