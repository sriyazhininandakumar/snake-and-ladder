import { useNavigate } from "react-router-dom";

const StartGame = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const startNewGame = async () => {
    try {
      const userid = localStorage.getItem("userid"); 
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("name");

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
    <div className="flex flex-col justify-center items-center min-h-screen bg-black">
      <div className="bg-black p-8 rounded-lg shadow-md w-96 border border-gray-200 text-center">
        <h2 className="text-2xl font-semibold text-white">
          Welcome, <span className="text-green-600">{username}!</span>
        </h2>
                <button
          onClick={startNewGame}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Start New Game
        </button>
      </div>
    </div>
  );
};

export default StartGame;

