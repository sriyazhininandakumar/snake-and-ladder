import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 

const OnlinePlayers = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const gameId = location.state?.gameId || localStorage.getItem("gameId");

  useEffect(() => {
    const fetchOnlinePlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        const currentUserId = String(localStorage.getItem("userid")); // Ensure string type

        console.log("🔹 Current User ID from localStorage:", currentUserId);

        const response = await fetch("http://localhost:3000/api/auth/online-players", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        console.log("🔹 All Players Fetched from API:", data.players);

        // Filtering out the current user
        const filteredPlayers = data.players.filter(
          (player) => String(player.userid) !== currentUserId
        );

        console.log("✅ Filtered Players (without current user):", filteredPlayers);

        setPlayers(filteredPlayers);
      } catch (error) {
        console.error("❌ Error fetching online players:", error);
      }
    };

    fetchOnlinePlayers();
    const interval = setInterval(fetchOnlinePlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const addPlayerToGame = async (playerId) => {
    try {
      const token = localStorage.getItem("token");
      console.log(`🟢 Adding Player ${playerId} to Game ${gameId}`);

      const response = await fetch(`http://localhost:3000/api/game/${gameId}/join`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userid: playerId }),
      });

      if (response.ok) {
        console.log("✅ Player added successfully!");
        navigate(`/game/${gameId}`);
      } else {
        console.error("❌ Failed to add player to game.");
      }
    } catch (error) {
      console.error("❌ Error adding player to game:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="bg-black-800 text-white p-8 rounded-lg shadow-lg w-96 border border-green-600">
        <h2 className="text-2xl font-bold text-green-600 text-center mb-4">Online Players</h2>

        {players.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {players.map((player) => {
              console.log(`🟡 Rendering Player: ${player.name} (ID: ${player.userid})`);
              
              return (
                <li 
                  key={player.userid} 
                  className="flex justify-between items-center bg-black p-3 rounded-md shadow-md hover:bg-gray-600 transition"
                >
                  <span className="text-lg font-medium">{player.name}</span>
                  
                  {/* Ensure button is not displayed for the current user */}
                  {String(player.userid) !== String(localStorage.getItem("userid")) && ( 
                    <>
                    {console.log(`Rendering Button for: ${player.name} (ID: ${player.userid})`)}
   
                    <button 
                      onClick={() => addPlayerToGame(player.userid)} 
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-emerald-600 transition"
                    >
                      Add to Game
                    </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400 text-lg text-center mt-4">No other players online</p>
        )}
      </div>
    </div>
  );
};

export default OnlinePlayers;
