import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const GamePage = () => {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState(null);
  const [diceRoll, setDiceRoll] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [winner, setWinner] = useState(null); 

  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userid");
  
    const fetchGameState = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/game/${gameId}`);
          const data = await response.json();
          console.log("Fetched game state:", data);
          setGameState(data);
          localStorage.setItem("gameData", JSON.stringify(data));
      
          if (data.players && data.players.length > 0) {
            const currentPlayerIndex = data.turn % data.players.length;
            const current = data.players[currentPlayerIndex];
            console.log("Setting current player:", current);
            setCurrentPlayer(current);

            const winningPlayer = data.players.find(player => data.positions[player.id] === 100);
            if (winningPlayer) {
              setWinner(winningPlayer);
            }
          }
        } catch (error) {
          console.error("Error fetching game state:", error);
        }
      };
      
      useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  

  const rollDice = async () => {
    if (!gameState || !gameState.players || gameState.players.length === 0) return;
  
  
    const currentPlayerIndex = gameState.turn % gameState.players.length;
    const currentPlayer = gameState.players[currentPlayerIndex];
    console.log("Current Player Index:", currentPlayerIndex);
    console.log("Current Player:", currentPlayer);
  
    try {
      const response = await fetch(`http://localhost:3000/api/game/${gameId}/roll`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: currentPlayer.id }),
      });
  
      const data = await response.json();
      console.log("Dice roll response:", data);
      setDiceRoll({ player: currentPlayer.name, value: data.diceRoll });
  
      setGameState((prev) => ({
        ...prev,
        positions: { ...prev.positions, [currentPlayer.id]: data.newPosition },
        players: prev.players.map((player) =>
          player.id === currentPlayer.id ? { ...player, position: data.newPosition } : player
        ),
        turn: prev.turn + 1, 
      }));
      await fetchGameState();
    } catch (error) {
      console.error("Error rolling dice:", error);
    }
  };
  


  const renderBoard = () => {
    if (!gameState) return <p>Loading game...</p>;

    const { board, players, positions } = gameState;

    const boardSize = 10;
    const boxes = [];

    for (let row = 9; row >= 0; row--) {
      for (let col = 0; col < boardSize; col++) {
        const isEvenRow = row % 2 === 1;
        const boxNumber = isEvenRow
          ? row * boardSize + (boardSize - col)
          : row * boardSize + (col + 1);

        const playerToken = players.find((p) => positions[p.id] === boxNumber)?.token || "";
        const isSnakeStart = board.snakes[boxNumber];
        const isLadderStart = board.ladders[boxNumber];

        boxes.push(
          <div
            key={boxNumber}
            className={`relative w-12 h-12 flex items-center justify-center border text-lg font-bold 
              ${playerToken ? "bg-blue-400 text-white" : "bg-gray-200"} 
              ${isSnakeStart ? "bg-red-500 text-white" : ""} 
              ${isLadderStart ? "bg-green-500 text-white" : ""}`}
          >
            {boxNumber}
            {playerToken && <div className="absolute top-0 right-0 text-sm">{playerToken}</div>}
            {isSnakeStart && <div className="absolute bottom-0 left-0 text-xs">↓ {isSnakeStart}</div>}
            {isLadderStart && <div className="absolute bottom-0 left-0 text-xs">↑ {isLadderStart}</div>}
          </div>
        );
      }
    }

    return (
      <div className="grid grid-cols-10 gap-1 p-4 border border-gray-800 w-fit mx-auto">
        {boxes}
      </div>
    );
  };

  return (
    <div className="text-center p-6">
        <h1 className="text-3xl font-bold mb-4">{username}'s Game Page</h1> 
      <h2 className="text-2xl font-bold mb-4">Snake and Ladder</h2>
     
        
        
  



{winner ? (
        <h2 className="text-xl font-bold mt-4 "> {winner.token} Wins the Game! </h2>
      ) : (
        gameState && gameState.players && (
          <h2 className="text-xl font-bold mt-4">
            {currentPlayer ? `Current Player: ${currentPlayer.token}` : "Loading..."}
          </h2>
        )
      )}

      {diceRoll !== null && <p className="text-lg font-bold">{username} rolled a {diceRoll.value}!</p>}
      {renderBoard()}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded"
        onClick={rollDice}    
        disabled={currentPlayer?.id != userId}   
      >
        Roll Dice
      </button>
    </div>
  );
};

export default GamePage;
