import { useNavigate } from "react-router-dom";

const StartGame = () => {
  const navigate = useNavigate();

  const startNewGame = async () => {
    try {
      const userid = localStorage.getItem("userid"); 
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userid }),
      });

      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      const data = await response.json();
      console.log("Game created:", data);

      localStorage.setItem("gameId", data.game.gameId);
      console.log("Stored gameId:", localStorage.getItem("gameId"));

      
      navigate("/online-players", { state: { gameId: data.game.gameId } });

    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  return (
    <div>
      <h2>Welcome!</h2>
      <button onClick={startNewGame}>Start Game</button>
    </div>
  );
};

export default StartGame;
