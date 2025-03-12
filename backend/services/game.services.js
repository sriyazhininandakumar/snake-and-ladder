const { Game, User } = require("../models");


const createGame = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  const token = user.name.slice(0, 2).toUpperCase();
  const game = await Game.create({
    userid: userId,
    game_state: {
      players: [{ id: userId, position: 1, token: token  }], 
      board: {
        size: 100,
        snakes: { "98": 40, "56": 3, "78": 45 },
        ladders: { "5": 25, "32": 74, "45": 90 }
      },
      turn: 0,
      dice_roll: null,
      positions: { [userId]: 1 },
      status: "waiting",
      winner: null
    }
  });

  return { gameId: game.gameid,game: game, joinUrl: `/api/game/${game.gameid}/join` };
};

const joinGame = async (gameId, userId) => {
  const game = await Game.findByPk(gameId);

  if (!game) throw new Error("Game not found");
  if (game.game_state.players.length >= 4) throw new Error("Game is full");
  if (game.game_state.status !== "waiting") throw new Error("Game already started");

  
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  const token = user.name.slice(0, 2).toUpperCase();

  const updatedGameState = { ...game.game_state };
  const newPlayer = { id: userId, position: 1, token: token };
  updatedGameState.players.push(newPlayer);
  updatedGameState.positions[userId] = 1;

  if (updatedGameState.players.length >= 2) {
    updatedGameState.status = "in_progress";
  }

  
  game.game_state = updatedGameState;
  game.changed("game_state"); 

  await game.save(); 

  return game;
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
