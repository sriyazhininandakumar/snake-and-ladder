const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.routes");
const gameRoutes = require("./routes/game.routes");
const gameService = require("./services/game.services");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing; restrict in production
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

io.on("connection", (socket) => {
  console.log(` New client connected: ${socket.id}`);

  // Listen for "joinGame" event from clients
  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
    console.log(`✅ User ${socket.id} joined game room: ${gameId}`);
  });

  // Listen for "rollDice" event
  socket.on("rollDice", async ({ gameId, userId }) => {
    console.log(`✅ rollDice event received! gameId: ${gameId}, userId: ${userId}`);
    try {
      const result = await gameService.rollDice(gameId, userId);
      const game = await gameService.getGameState(gameId); // Implement this function in gameService
        const player = game.players.find(p => p.id === userId); 
        if (!player) {
          throw new Error("Player not found in game");
      }
      console.log(`🔄 Backend Dice Roll: ${result.diceRoll}`);
      io.to(gameId).emit("gameStateUpdate", {
        diceRoll: result.diceRoll,
        player, 
        newPosition: result.newPosition,
        winner: result.winner || null,
      });
      console.log("📢Emitting gameStateUpdate:", {
        diceRoll: result.diceRoll,
        player,
        newPosition: result.newPosition,
        winner: result.winner || null
      });
      

      console.log(`Dice Roll: ${result.diceRoll} | Player ${userId} moved to ${result.newPosition}`);
    } catch (error) {
      console.error("Error rolling dice:", error.message);
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  sequelize
    .sync()
    .then(() => {
      console.log("Database connected successfully!");
      server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => console.error("Database connection failed:", error));
}

module.exports = app;
