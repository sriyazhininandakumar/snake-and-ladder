const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const authRoutes = require("./routes/auth.routes");
const gameRoutes = require("./routes/game.routes");

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);


const PORT = process.env.PORT || 5000;
sequelize
  .sync() 
  .then(() => {
    console.log("Database connected successfully!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("Database connection failed:", error));
