const { Game, User } = require("../models");
const { Op } = require("sequelize");

const createGame = async (userId) => {
  const game = await Game.create({
    gameid: Math.floor(1000 + Math.random() * 9000), 
    userid: userId,
    game_state: {
      players: [{ id: userId, position: 0 }], 
      board: {
        size: 100,
        snakes: { "98": 40, "56": 3, "78": 45 },
        ladders: { "5": 25, "32": 74, "45": 90 }
      },
      turn: userId,
      dice_roll: null,
      positions: { [userId]: 0 },
      status: "waiting",
      winner: null
    }
  });

  return { gameId: game.gameid, joinUrl: `/api/game/${game.gameid}/join` };
};

const joinGame = async (gameId, userId) => {
  const game = await Game.findByPk(gameId);

  if (!game) throw new Error("Game not found");
  if (game.game_state.players.length >= 4) throw new Error("Game is full");
  if (game.game_state.status !== "waiting") throw new Error("Game already started");

  // Create a new game state object
  const updatedGameState = { ...game.game_state };
  updatedGameState.players.push({ id: userId, position: 0 });
  updatedGameState.positions[userId] = 0;

  if (updatedGameState.players.length >= 2) {
    updatedGameState.status = "in_progress";
  }

  // Assign and explicitly mark game_state as changed
  game.game_state = updatedGameState;
  game.changed("game_state"); // <- Important: Tells Sequelize to track this field

  await game.save(); // Persist to DB

  return game;
};



const rollDice = async (gameId, userId) => {
  const game = await Game.findByPk(gameId);
  if (!game) throw new Error("Game not found");

  const { players, turn, positions, board, status } = game.game_state;
  if (status !== "in_progress") throw new Error("Game is not in progress");
  if (turn !== userId) throw new Error("Not your turn");

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  let newPosition = positions[userId] + diceRoll;

  if (board.snakes[newPosition]) {
    newPosition = board.snakes[newPosition];
  } else if (board.ladders[newPosition]) {
    newPosition = board.ladders[newPosition];
  }

  game.game_state.positions[userId] = Math.min(newPosition, board.size);

  let winner = null;
  if (game.game_state.positions[userId] === board.size) {
    winner = userId;
    game.game_state.status = "finished";
    game.game_state.winner = winner;
  }

  const currentIndex = players.findIndex(p => p.id === userId);
  const nextPlayer = players[(currentIndex + 1) % players.length].id;
  game.game_state.turn = nextPlayer;
  game.game_state.dice_roll = diceRoll;

  await game.save();
  return { diceRoll, newPosition, winner };
};

const getGameState = async (gameId) => {
  const game = await Game.findByPk(gameId);
  if (!game) throw new Error("Game not found");
  return game.game_state;
};

module.exports = {
  createGame,
  joinGame,
  rollDice,
  getGameState
};
