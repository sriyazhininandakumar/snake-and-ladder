import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 

const OnlinePlayers = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userid"); 
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
  
        
        const filteredPlayers = data.players.filter(
          (player) => String(player.userid) !== String(currentUserId) 
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
    <div>
      <h2>Online Players</h2>
      <ul>
        {players.map((player) => (
          <li key={player.userid}>
            {player.name}{" "}
            <button onClick={() => addPlayerToGame(player.userid)}>Add to Game</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlinePlayers;
