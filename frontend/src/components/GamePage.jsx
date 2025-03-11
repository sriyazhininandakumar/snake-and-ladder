import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const GamePage = () => {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState(null);
  const [diceRoll, setDiceRoll] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/game/${gameId}`);
        const data = await response.json();
        console.log("Fetched game state:", data);
        setGameState(data);
        localStorage.setItem("gameData", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  const rollDice = async () => {
    if (!gameState) return;

    const players = gameState.players;
    const currentPlayer = players[currentPlayerIndex]; 

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
      }));

      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
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
      <h2 className="text-2xl font-bold mb-4">Snake and Ladder</h2>
      {diceRoll !== null && <p className="text-lg font-bold">{diceRoll.player} rolled a {diceRoll.value}!</p>}
      {renderBoard()}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded"
        onClick={rollDice}
      >
        Roll Dice
      </button>
    </div>
  );
};

export default GamePage;
