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
  const [leadingPlayer, setLeadingPlayer] = useState(null);

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

            let leading = data.players.reduce((max, player) => 
              data.positions[player.id] > data.positions[max.id] ? player : max, data.players[0]);
    
            setLeadingPlayer(leading);
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
  
    const snakeColors = {
      98: "bg-red-800", 
      56: "bg-orange-600", 
      78: "bg-orange-700", 
    };
  
    const ladderColors = {
      5: "bg-green-600",  
      32: "bg-emerald-900", 
      45: "bg-emerald-700", 
    };
  
    for (let row = 9; row >= 0; row--) {
      for (let col = 0; col < boardSize; col++) {
        const isEvenRow = row % 2 === 1;
        const boxNumber = isEvenRow
          ? row * boardSize + (boardSize - col)
          : row * boardSize + (col + 1);
  
        const playersInBox = players.filter((p) => positions[p.id] === boxNumber);
  
        const isSnakeStart = board.snakes[boxNumber];
        const isSnakeEnd = Object.values(board.snakes).includes(boxNumber);
        const isLadderStart = board.ladders[boxNumber];
        const isLadderEnd = Object.values(board.ladders).includes(boxNumber);
  
        let boxClass = "bg-gray-900"; 
  
        if (isSnakeStart) boxClass = snakeColors[boxNumber] || "bg-red-600";
        if (isSnakeEnd) boxClass = snakeColors[Object.keys(board.snakes).find(key => board.snakes[key] === boxNumber)] || "bg-red-600";
  
        if (isLadderStart) boxClass = ladderColors[boxNumber] || "bg-green-600";
        if (isLadderEnd) boxClass = ladderColors[Object.keys(board.ladders).find(key => board.ladders[key] === boxNumber)] || "bg-green-600";
  
        boxes.push(
          <div
            key={boxNumber}
            className={`relative w-12 h-12 flex items-center justify-center border text-xs font-bold ${boxClass}`}
          >
            <div className="absolute top-1 right-1 text-xs font-bold text-gray-100">
              {boxNumber}
            </div>
  
            
            {playersInBox.length > 0 && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-1">
                {playersInBox.map((player, index) => (
                  <div
                    key={player.id}
                    className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-500 text-white text-xs"
                    style={{ zIndex: index + 1 }}
                  >
                    {player.token}
                  </div>
                ))}
              </div>
            )}
  
            
            {isSnakeStart && <div className="absolute bottom-0 left-0 text-xs text-white"><div className="text-4xl font-bold">↓</div>SH {isSnakeStart}</div>}
            {isSnakeEnd && <div className="absolute top-0 left-0 text-xs text-white">ST</div>}
            {isLadderStart && <div className="absolute bottom-0 left-0 text-xs text-white"><div className="text-4xl font-bold">↑</div>LH {isLadderStart}</div>}
            {isLadderEnd && <div className="absolute top-0 left-0 text-xs text-white">LT</div>}
          </div>
        );
      }
    }
  
    return (
      <div className="grid grid-cols-10 gap-1 p-4 border border-white w-fit mx-auto">
        {boxes}
      </div>
    );
  };
  
  return (
    <>
    <div className="bg-black min-h-screen text-black p-6">
     
      <h1 className="text-3xl font-bold text-center mt-8 text-green-600">
        WELCOME {username.toUpperCase()}!
      </h1>
      <div className="flex gap-6 mt-20 justify-center ">
      <div className="p-4 border border-white w-64 rounded-lg  text-white">
      {gameState?.players && (
         <div className="space-y-4">
          <h2 className="text-xl font-bold mb-2 text-yellow-500 text-center">PLAYERS</h2>
          <ul className="font-bold text-center space-y-1">
            {gameState.players.map(player => (
              <li key={player.id} className="text-lg text-white"> {player.name.toUpperCase() }  </li>
            ))}
          </ul>
          <h2 className="text-lg font-bold text-green-600 text-center">GAME ID: {gameId}</h2>
          {winner ? (
        <h2 className="text-2xl font-bold text-center text-emerald-900 text-center mt-4">
          {winner.name.toUpperCase()} WINS THE GAME! 
        </h2>
      ) : (
        gameState?.players && (
          <h2 className="text-xl font-bold text-lime-600 text-center mt-4">
            {currentPlayer ? `CURRENT PLAYER: ${currentPlayer.token}` : "Loading..."}
          </h2>
        )
      )}
       {leadingPlayer && (
                  <h2 className="text-xl font-bold text-cyan-500 text-center mt-4">
                    LEADING PLAYER: {leadingPlayer.token}
                  </h2>
                )}
       {diceRoll && (
        <p className="text-lg font-bold text-center mt-2 text-orange-600">
          {diceRoll.player.toUpperCase() === username.slice(0, 2).toUpperCase()
            ? `YOU ROLLED A ${diceRoll.value}!`
            : `${diceRoll.player} ROLLED A ${diceRoll.value}!`}
        </p>
      )}
        </div>
      )}
  </div>
  <div className="flex flex-col items-center"></div>
  <div className="flex justify-center">{renderBoard()}</div>
     
  
     
    
      
    <div className="flex flex-col">
      <div className="text-center">
        <button
          className=" px-9 py-9 mt-40 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition"
          onClick={rollDice}
          disabled={currentPlayer?.id != userId}
        >
          Roll Dice
        </button>
      </div></div>
    </div></div>
    </>
  );
  

 
};

export default GamePage;