import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

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

  useEffect(() => {
    socket.emit("joinGame", gameId); 
    console.log(`Joined game room: ${gameId}`);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
  
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [gameId]);
  



  useEffect(() => {
    const handleGameStateUpdate = (data) => {
      console.log("Received gameStateUpdate in frontend:", data);
  
      if (data.diceRoll !== undefined) {
        console.log("Updating Dice Roll:", data.diceRoll);
        setDiceRoll({ value: data.diceRoll, player: data.player.token });
      } else {
        console.log("Dice roll data missing!");
      }
  
      setGameState(prevState => ({
        ...prevState,
        positions: { ...prevState.positions, [data.player.id]: data.newPosition },
        turn: prevState.turn + 1,
      }));
  
      if (data.winner) {
        setWinner(data.winner);
      }
    };
  
    socket.on("gameStateUpdate", handleGameStateUpdate);
  
    return () => {
      console.log("Removing gameStateUpdate listener");
      socket.off("gameStateUpdate", handleGameStateUpdate);
    };
  }, []);
  



  const rollDice = () => {

    if (!gameState || !gameState.players || gameState.players.length === 0) return;

    const currentPlayerIndex = gameState.turn % gameState.players.length;
    const currentPlayer = gameState.players[currentPlayerIndex];

    console.log("Current Player:", currentPlayer);
    console.log("Rolling dice via WebSocket...");
    console.log("dice roll:", diceRoll);
    console.log("Emitting rollDice:", { gameId, userId: currentPlayer.id });
    socket.emit("rollDice", { gameId, userId: currentPlayer.id });
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
            className={`relative w-12 h-12 flex items-center justify-center border text-xs font-bold 
              ${isSnakeStart ? "bg-red-500 text-white" : ""} 
              ${isLadderStart ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            {boxNumber}
        
            {/* Player Token as Blue Circle */}
            {playerToken && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500 text-white text-xs">
                  {playerToken}
                </div>
              </div>
            )}
        
            {/* Snake & Ladder Indicators */}
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

<>

    {gameState && gameState.players && (
  <div className="mt-4">
    <h2 className="text-xl font-bold mb-2">Players in the Game:</h2>
    <ul className="text-green-600 font-bold">
      {gameState.players.map((player) => (
        <li key={player.id} className="text-lg">{player.token}</li>
      ))}
    </ul>
    <h2 className="text-lg font-bold text-gray-700 mt-2">Game ID: {gameId}</h2>

  </div>
)}

    <div className="text-center p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome {username}!</h1> 
      
     
        
        
  


{winner ? (
        <h2 className="text-xl font-bold mt-4 "> {winner.token} Wins the Game! </h2>
      ) : (
        gameState && gameState.players && (
          <h2 className="text-xl font-bold mt-4">
            {currentPlayer ? `Current Player: ${currentPlayer.token}` : "Loading..."}
          </h2>
        )
      )}

{diceRoll && (
  <p className="text-lg font-bold">
    {console.log("diceRoll.player:", diceRoll.player, "username:", username, "username.slice(0,2):", username.slice(0, 2).toUpperCase())}
    {diceRoll.player.toUpperCase() === username.slice(0, 2).toUpperCase()  
      ? `You rolled a ${diceRoll.value}!`  
      : `${diceRoll.player} rolled a ${diceRoll.value}!`}
  </p>
)}





      
      {renderBoard()}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded"
        onClick={rollDice}    
        disabled={currentPlayer?.id != userId}   
      >
        Roll Dice
      </button>
    </div></>
  );
};

export default GamePage;


