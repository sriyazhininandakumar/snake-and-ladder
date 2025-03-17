import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 

const OnlinePlayers = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userid")?.toString(); 
  const location = useLocation();
  const gameId = location.state?.gameId || localStorage.getItem("gameId"); 

  useEffect(() => {
    const fetchOnlinePlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/auth/online-players", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        console.log("Fetched players:", data.players); 

        // Make sure current user is removed
        const filteredPlayers = data.players.filter(
          (player) => String(player.userid) !== currentUserId
        );

        console.log("Filtered players:", filteredPlayers); 

        setPlayers(filteredPlayers);
      } catch (error) {
        console.error("Error fetching online players:", error);
      }
    };

    fetchOnlinePlayers();
    const interval = setInterval(fetchOnlinePlayers, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const addPlayerToGame = async (playerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/game/${gameId}/join`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userid: playerId }),
      });

      if (response.ok) {
        console.log("Player added successfully!");
        navigate(`/game/${gameId}`); 
      } else {
        console.error("Failed to add player to game.");
      }
    } catch (error) {
      console.error("Error adding player to game:", error);
    }
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Online Players</h2>
      {players.length > 0 ? (
        <ul className="space-y-2">
          {players.map((player) => (
            <li 
              key={player.userid} 
              className="flex items-center justify-between border-b border-gray-300 p-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-gray-900">{player.name}</span>
                {String(player.userid) !== currentUserId && ( 
                  <button 
                    onClick={() => addPlayerToGame(player.userid)} 
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Add to Game
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 text-lg">No other players online</p>
      )}
    </div>
  );
};

export default OnlinePlayers;
