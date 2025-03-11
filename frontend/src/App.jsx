import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import StartGame from "./components/StartGame";
import OnlinePlayers from "./components/OnlinePlayers";

import GamePage from "./components/GamePage";

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/start-game" element={<StartGame />} />
        <Route path="/online-players" element={<OnlinePlayers />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
  );
}

export default App;
