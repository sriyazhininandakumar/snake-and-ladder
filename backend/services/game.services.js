const { Game, User } = require("../models");


const createGame = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  const token = user.name.slice(0, 2).toUpperCase();
  const game = await Game.create({
    userid: userId,
    game_state: {
      players: [{ id: userId,name: user.name, position: 1, token: token  }], 
      board: {
        size: 100,
        snakes: { "98": 40, "56": 3, "78": 44 },
        ladders: { "5": 25, "32": 74, "45": 90 }
      },
      turn: 0,
      dice_roll: null,
      positions: { [userId]: 1 },
      status: "waiting",
      winner: null
    }
  });
  console.log("User name:", user.name); 
  return { gameId: game.gameid,game: game, joinUrl: `/api/game/${game.gameid}/join` };
};

const joinGame = async (gameId, userId) => {
  try {
      const user = await User.findByPk(userId);
      if (!user) {
          console.error("User not found:", userId);
          throw new Error("User not found");
      }
      const game = await Game.findByPk(gameId);
      if (!game) {
          throw new Error("Game not found");
      }
      const gameState = game.game_state || {};

      if (!gameState.players) {
          gameState.players = [];
      }
           if (gameState.players.length >= 4) {
          throw new Error("Game is full");
      }
  if (gameState.players.some(player => player.id === userId)) {
          throw new Error("User already joined the game");
      }
 const token = user.name.slice(0, 2).toUpperCase();

       const newPlayer = {
          id: userId,
          name: user.name,
          token: token,
          position: 1
      };
      gameState.players.push(newPlayer);

      if (!gameState.positions) {
          gameState.positions = {};
      }
      gameState.positions[userId] = 1;

       gameState.status = gameState.players.length >= 2 ? "in_progress" : "waiting";

      console.log("Before saving:", JSON.stringify(gameState, null, 2));

      game.game_state = gameState;
      game.changed("game_state", true);
      await game.save();

       const updatedGame = await Game.findByPk(gameId);
      console.log("After saving, checking DB:", JSON.stringify(updatedGame.game_state, null, 2));

      return updatedGame;
  } catch (error) {
      console.error("Error joining game:", error.message);
      throw error;
  }
};




const rollDice = async (gameId, userId) => {
  const game = await Game.findByPk(gameId);
  if (!game) throw new Error("Game not found");

  const { players, turn, positions, board, status } = game.game_state;

  if (status !== "in_progress") throw new Error("Game is not in progress");
 
  const currentPlayerIndex = turn % players.length;
  const currentPlayer = players[currentPlayerIndex];

  if (currentPlayer.id !== userId) throw new Error("Not your turn");
 
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  let newPosition = positions[userId] + diceRoll;

  if (newPosition > board.size) newPosition = positions[userId];
 
  if (board.snakes[newPosition]) {
    newPosition = board.snakes[newPosition];
  } else if (board.ladders[newPosition]) {
    newPosition = board.ladders[newPosition];
  }
 
  let updatedGameState = { ...game.game_state };
  updatedGameState.positions[userId] = Math.min(newPosition, board.size);
   
  updatedGameState.players = updatedGameState.players.map(player => ({
    ...player,
    position: updatedGameState.positions[player.id]
  }));

  let winner = null;
  if (updatedGameState.positions[userId] === board.size) {
    winner = userId;
    updatedGameState.status = "finished";
    updatedGameState.winner = winner;
  } else {
    updatedGameState.turn += 1; 
  }
  
  updatedGameState.dice_roll = diceRoll;
  game.game_state = updatedGameState;
  game.changed("game_state", true);
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
