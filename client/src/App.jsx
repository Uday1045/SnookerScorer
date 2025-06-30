// import { useState, useEffect } from "react";
// import HomePage from "./pages/HomePage";
// import TournamentPage from "./pages/TournamentPage";
// import Header from "./components/Header";
// import Scoreboard from "./components/Scoreboard";
// import BallControls from "./components/BallControls";
// import ActionControls from "./components/ActionControls";
// import FrameStats from "./components/FrameStats";
// import FoulControls from "./components/FoulsControls";
// import AdminDashboard from "./components/AdminDashboard";
// import GameHistory from "./components/GameHistory";
// import MultiplayerPage from "./pages/MultiplayerPage"; 

// export default function App() {
 
//   const [mode, setMode] = useState("home");
//   const [tournamentMatch, setTournamentMatch] = useState(null);
//   const [multiplayerMatch, setMultiplayerMatch] = useState(null);
//   const [tournamentStage, setTournamentStage] = useState("setup");
//   const [multiplayerStage, setMultiplayerStage] = useState("setup");
//   const [multiplayerPlayers, setMultiplayerPlayers] = useState(["", ""]);
//   const [tournamentPlayers, setTournamentPlayers] = useState(["", "", "", ""]);
//   const [semifinalMatches, setSemifinalMatches] = useState([]);
//   const [finalMatch, setFinalMatch] = useState(null);

//   const [scores, setScores] = useState([0, 0]);
//   const [currentPlayer, setCurrentPlayer] = useState(0);
//   const [redsRemaining, setRedsRemaining] = useState(15);
//   const [selectedMatchType, setSelectedMatchType] = useState(null);
//   const [expectingColor, setExpectingColor] = useState(false);
//   const [colorsPhase, setColorsPhase] = useState(false);
//   const [colorSequenceIndex, setColorSequenceIndex] = useState(0);
//   const [playerNames, setPlayerNames] = useState(["Player 1", "Player 2"]);
//   const [playerIds, setPlayerIds] = useState([null, null]);
//   const [showFrameDialog, setShowFrameDialog] = useState(false);
//   const [history, setHistory] = useState([]); // For undo
// const [potHistory, setPotHistory] = useState([[], []]);
//   const colorSequence = ["Yellow", "Green", "Brown", "Blue", "Pink", "Black"];
//   const API_BASE = "http://localhost:5000/api";

//   const handleSubmitPlayers = async () => {
//     try {
//       const responses = await Promise.all(
//         playerNames.map((name) =>
//           fetch(`${API_BASE}/players`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ name }),
//           }).then((res) => res.json())
//         )
//       );

//       const ids = responses.map((player) => player._id);
//       setPlayerIds(ids);
//     } catch (error) {
//       console.error("Error submitting player names:", error);
//     }
//   };

//   const addToHistory = () => {
//     setHistory((prev) => [
//       ...prev,
//       {
//         scores,
//         currentPlayer,
//         redsRemaining,
//         expectingColor,
//         colorsPhase,
//         colorSequenceIndex,
//         potHistory,
//       },
//     ]);
//   };

//   const undo = () => {
//     setHistory((prev) => {
//       if (prev.length === 0) return prev;

//       const last = prev[prev.length - 1];
//       setScores(last.scores);
//       setCurrentPlayer(last.currentPlayer);
//       setRedsRemaining(last.redsRemaining);
//       setExpectingColor(last.expectingColor);
//       setColorsPhase(last.colorsPhase);
//       setColorSequenceIndex(last.colorSequenceIndex);
//       setPotHistory(last.potHistory);


//       return prev.slice(0, prev.length - 1);
//     });
//   };

//   const handleModeSelect = (selectedMode) => {
//     setMode(selectedMode);
//     if (selectedMode === "tournament") {
//       setTournamentStage("setup");
//       setTournamentPlayers(["", "", "", ""]);
//       setSemifinalMatches([]);
//       setFinalMatch(null);
//     }
//     if (selectedMode === "multiplayer") {
//       setMultiplayerStage("setup");
//       setMultiplayerPlayers(["", ""]);
//     }
//     resetGame();
//   };
  

//   const handlePlayerNameChange = async (index, value) => {
//   const newPlayers = [...players];
//   newPlayers[index] = value;
//   setPlayers(newPlayers);

//   try {
//     // Try to fetch player by name
//     const res = await fetch(`http://localhost:5000/api/players/name/${value}`);
//     const data = await res.json();

//     if (data?._id) {
//       const updatedIds = [...playerIds];
//       updatedIds[index] = data._id;
//       setPlayerIds(updatedIds);
//     } else {
//       // Player not found, create them
//       const createRes = await fetch("http://localhost:5000/api/players", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: value }),
//       });
//       const newPlayer = await createRes.json();
//       const updatedIds = [...playerIds];
//       updatedIds[index] = newPlayer._id;
//       setPlayerIds(updatedIds);
//     }
//   } catch (err) {
//     console.error("Player fetch/create failed", err);
//   }
// };

//   const handleFrameComplete = () => {
//     const winnerIndex = scores[0] > scores[1] ? 0 : 1;

//     if (mode === "tournament" && tournamentMatch?.onComplete) {
//       tournamentMatch.onComplete(playerNames[winnerIndex]);
//       setMode("tournament");
//       setTournamentMatch(null);
//       resetGame();
//     } else {
//       setShowFrameDialog(true);
//     }

//     saveMatchToBackend(matchdata);
//   };

//   const handleTournamentMatchStart = (player1, player2, onComplete) => {
//     setPlayerNames([player1, player2]);
//     setTournamentMatch({ onComplete });
//     resetGame();
//     setMode("tournament");
//   };
//   const handleMultiplayerMatchStart = (player1, player2, onComplete) => {
//     setPlayerNames([player1, player2]);
//     setMultiplayerMatch({ onComplete });
//     resetGame();
//     setMode("multiplayer");
//   };


//   const addPoints = (points, ball) => {
//   addToHistory();
//   const updated = [...scores];
//     updated[currentPlayer] += points;
//     setScores(updated);
//   setPotHistory((prev) => {
//     const updated = [...prev];
//     if (!updated[currentPlayer]) updated[currentPlayer] = [];
//     updated[currentPlayer] = [...updated[currentPlayer], ball];
//     return updated;
//   });
//     if (!colorsPhase) {
//       if (ball === "Red") {
//         setRedsRemaining((prev) => {
//           const after = prev - 1;
//           setExpectingColor(true);
//           return after;
//         });
//         return;
//       }

//       if (redsRemaining === 0) {
//         setColorsPhase(true);
//         setColorSequenceIndex(0);
//       } else {
//         setExpectingColor(false);
//       }
//     } else {
//       if (ball === colorSequence[colorSequenceIndex]) {
//         if (colorSequenceIndex < colorSequence.length - 1) {
//           setColorSequenceIndex((i) => i + 1);
//         } else {
//           handleFrameComplete();
//         }
//       }
//     }
//   };

//   const nextTurn = () => {
//     addToHistory();
//     setCurrentPlayer((prev) => (prev === 0 ? 1 : 0));
//     setExpectingColor(false);
//   };

//   const handleNoPot = () => {
//     addToHistory();
//     addPoints(0, "Miss");
  
//     nextTurn();
//   };

  

//   const resetGame = () => {
//     setScores([0, 0]);
//     setCurrentPlayer(0);
//     setRedsRemaining(selectedMatchType);
//     setExpectingColor(false);
//     setColorsPhase(false);
//     setColorSequenceIndex(0);
//     setShowFrameDialog(false);
//     setHistory([]);
// setPotHistory([[], []]);
//   };
//   const handleMatchTypeChange = (numReds) => {
//   setRedsRemaining(numReds);
//     setSelectedMatchType(numReds);


// };

//   const handleFoul = (points) => {
//     addToHistory();
//     const updated = [...scores];
//     const opponent = currentPlayer === 0 ? 1 : 0;
//     updated[opponent] += points;
//     setScores(updated);
     

//     setExpectingColor(false);

//     nextTurn();
    
//   };

//   const FrameCompletionDialog = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-green-800 p-6 rounded-lg text-white">
//         <h2 className="text-2xl font-bold mb-4">Frame Complete!</h2>
//         <p className="mb-4">{scores[0] > scores[1] ? playerNames[0] : playerNames[1]} wins the frame!</p>
//         <div className="flex justify-between gap-4">
//           <button
//             onClick={() => {
//               resetGame();
//               setShowFrameDialog(false);
//             }}
//             className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
//           >
//             New Frame
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   if (mode === "home") {
//     return (
//       <HomePage 
//         onModeSelect={handleModeSelect} 
//         onAdminMode={() => setMode("admin")} 
//       />
//     );
//   }

//   if (mode === "tournament" && !tournamentMatch) {
//     return (
//       <TournamentPage
//         onStartMatch={handleTournamentMatchStart}
//         onBackToHome={() => setMode("home")}
//         tournamentStage={tournamentStage}
//         setTournamentStage={setTournamentStage}
//         players={tournamentPlayers}
//         setPlayers={setTournamentPlayers}
//         semifinalMatches={semifinalMatches}
//         setSemifinalMatches={setSemifinalMatches}
//         finalMatch={finalMatch}
//         setFinalMatch={setFinalMatch}
//          handleMatchTypeChange={handleMatchTypeChange}
//      selectedMatchType={selectedMatchType} // ✅ Add this
//   setSelectedMatchType={setSelectedMatchType} // ✅ Add this if needed
        
//       />
//     );
//   }
//   if (mode === "multiplayer" && !multiplayerMatch) {

//     return (
//       <MultiplayerPage
//         onStartMatch={handleMultiplayerMatchStart}
//         onBackToHome={() => setMode("home")}
//  playerIds={playerIds}
//   setPlayerIds={setPlayerIds}
//         multiplayerStage={multiplayerStage}
//         setMultiplayerStage={setMultiplayerStage}
//         players={multiplayerPlayers}
//         setPlayers={setMultiplayerPlayers}
//         handlePlayerNameChange={handlePlayerNameChange}
//     matchScores={scores}
//     setMatchScores={setScores}
//      handleMatchTypeChange={handleMatchTypeChange}
//      selectedMatchType={selectedMatchType} // ✅ Add this
//   setSelectedMatchType={setSelectedMatchType} // ✅ Add this if needed

//       />
//     );
//   }

//   if (mode === "admin") {
//     return <AdminDashboard onBackToHome={() => setMode("home")} />;
//   }

//   return (
//     <div
//       style={{
//         backgroundImage: "url('/snooker.jpg')",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         minHeight: "100vh",
//         width: "100vw",
//         position: "absolute",
//         top: 0,
//         left: 0,
//       }}
//     >
//       <div className="min-h-screen w-full bg-black bg-opacity-40">
//         <div className="max-w-3xl mx-auto space-y-6 p-4">
//           <button
//   onClick={() => {
//     if (mode === "tournament") {
//       setTournamentMatch(null);
//     } else if (mode === "multiplayer") {
//       setMultiplayerStage("setup");
//     }
//     setMode("home");
//   }}
//   className="bg-green-800 px-4 py-2 rounded text-white hover:bg-green-700"
// >
//   ← Back
// </button>

          

          

//           <Header />
          
//           <GameHistory 
//           history={potHistory} 
//           playerNames={mode === 'multiplayer' ? multiplayerPlayers : tournamentPlayers}
//           />
// <Scoreboard
//   playerNames={mode === 'multiplayer' ? multiplayerPlayers : tournamentPlayers}
//   scores={scores}
// />


//           <BallControls
//             onPot={addPoints}
//             expectingColor={expectingColor}
//             redsRemaining={redsRemaining}
//             colorsPhase={colorsPhase}
//             colorSequenceIndex={colorSequenceIndex}
//           />

//           <ActionControls
//             onReset={resetGame}
//             onNoPot={handleNoPot}
//             onNextTurn={nextTurn}
//             onUndo={undo}
//           />

//           <FrameStats
//             currentPlayer={currentPlayer}
//             playerNames={mode === 'multiplayer' ? multiplayerPlayers : tournamentPlayers}
//           />
//           <FoulControls onFoul={handleFoul} />

//           {showFrameDialog && <FrameCompletionDialog />}
//         </div>
//       </div>
//     </div>
//   );
// }
// }
// import React, { useState} from "react";
// import { BrowserRouter as Router, Routes, Route ,useLocation} from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import Login from "./pages/login";
// import Register from "./pages/register";
// import TournamentPage from "./pages/TournamentPage";
// import MultiplayerPage from "./pages/MultiplayerPage";
// import TournamentMatchPage from "./pages/Tournament";
// import MatchHistoryPage from "./pages/MatchHistoryPage";
// import ProtectedRoute from "./components/ProtectedRoute";
// import MatchPage from "./pages/Temp";
// import Navbar from "./components/NavBar";


// function App() {
 
//  const [tournamentPlayers, setTournamentPlayers] = useState(["", "", "", ""]);
// const [tournamentStage, setTournamentStage] = useState("setup");
// const [semifinalMatches, setSemifinalMatches] = useState([]);
// const [finalMatch, setFinalMatch] = useState(null);
// const [selectedMatchType, setSelectedMatchType] = useState(null);
// const location = useLocation();

//   const showNavbar = location.pathname === "/"; 
//   return (
//     <Router>
//   {showNavbar && <Navbar />}     
//    <Routes>
          
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<HomePage />} />
//         <Route
//           path="/multiplayerPage"
//           element={
//             <ProtectedRoute><MultiplayerPage
             
//             />  </ProtectedRoute>
//           }
//         />
//         <Route path="/tournamentPage"
//         element={
//         <TournamentPage 
//          players={tournamentPlayers}
//               setPlayers={setTournamentPlayers}
//               tournamentStage={tournamentStage}
//               setTournamentStage={setTournamentStage}
//               semifinalMatches={semifinalMatches}
//               setSemifinalMatches={setSemifinalMatches}
//               finalMatch={finalMatch}
//               setFinalMatch={setFinalMatch}
//               selectedMatchType={selectedMatchType}
//               setSelectedMatchType={setSelectedMatchType}
        
//         />} />
//         <Route path="/match" element={<MatchPage />} />
      
// <Route path="/tournament" element={<TournamentPage

//   players={tournamentPlayers}
//       setPlayers={setTournamentPlayers}
//       tournamentStage={tournamentStage}
//       setTournamentStage={setTournamentStage}
//       semifinalMatches={semifinalMatches}
//       setSemifinalMatches={setSemifinalMatches}
//       finalMatch={finalMatch}
//       setFinalMatch={setFinalMatch}
//       selectedMatchType={selectedMatchType}
//       setSelectedMatchType={setSelectedMatchType}
//     />
//   }
// />






//         {/* Tournament-specific Match Page */}
//        <Route path="/tournament-match" element={<TournamentMatchPage />} />
//        <Route path="/history" element={<MatchHistoryPage onBackToHome={() => navigate("/")} />} />

//       </Routes>
//     </Router>
//   );
// }

// export default App;
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TournamentPage from "./pages/TournamentPage";
import MultiplayerPage from "./pages/MultiplayerPage";
import TournamentMatchPage from "./pages/Tournament";
import MatchHistoryPage from "./pages/MatchHistoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MatchPage from "./pages/Temp";
import Navbar from "./components/Navy";

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tournamentPlayers, setTournamentPlayers] = useState(["", "", "", ""]);
  const [tournamentStage, setTournamentStage] = useState("setup");
  const [semifinalMatches, setSemifinalMatches] = useState([]);
  const [finalMatch, setFinalMatch] = useState(null);
  const [selectedMatchType, setSelectedMatchType] = useState(null);

  const showNavbar = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        <Route
          path="/multiplayerPage"
          element={
            <ProtectedRoute>
              <MultiplayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournamentPage"
          element={
            <TournamentPage
              players={tournamentPlayers}
              setPlayers={setTournamentPlayers}
              tournamentStage={tournamentStage}
              setTournamentStage={setTournamentStage}
              semifinalMatches={semifinalMatches}
              setSemifinalMatches={setSemifinalMatches}
              finalMatch={finalMatch}
              setFinalMatch={setFinalMatch}
              selectedMatchType={selectedMatchType}
              setSelectedMatchType={setSelectedMatchType}
            />
          }
        />
        <Route path="/match" element={<MatchPage />} />

        <Route
          path="/tournament"
          element={
            <TournamentPage
              players={tournamentPlayers}
              setPlayers={setTournamentPlayers}
              tournamentStage={tournamentStage}
              setTournamentStage={setTournamentStage}
              semifinalMatches={semifinalMatches}
              setSemifinalMatches={setSemifinalMatches}
              finalMatch={finalMatch}
              setFinalMatch={setFinalMatch}
              selectedMatchType={selectedMatchType}
              setSelectedMatchType={setSelectedMatchType}
            />
          }
        />

        <Route path="/tournament-match" element={<TournamentMatchPage />} />
        <Route
          path="/history"
          element={<MatchHistoryPage onBackToHome={() => navigate("/")} />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
