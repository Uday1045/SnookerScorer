import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Scoreboard from "../components/Scoreboard";
import BallControls from "../components/BallControls";
import ActionControls from "../components/ActionControls";
import GameHistory from "../components/GameHistory";
import FrameStats from "../components/FrameStats";
import FoulControls from "../components/FoulControls";

export default function MatchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract from state sent via navigate("/match", { state: { ... } })
  const { mode, players = ["Player 1", "Player 2"], matchType = 15 } = location.state || {};
  
 const [multiplayerPlayers, setMultiplayerPlayers] = useState(["", ""]);
  // Safety check
  useEffect(() => {
    if (!mode || !players || !matchType) {
      navigate("/");
    }
  }, [mode, players, matchType, navigate]);
//  const [tournamentMatch, setTournamentMatch] = useState(null);

  const [matchStarted, setMatchStarted] = useState(false);
  const [scores, setScores] = useState([0, 0]);
  const [potHistory, setPotHistory] = useState([[], []]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [redsRemaining, setRedsRemaining] = useState(matchType);
const [showFrameDialog, setShowFrameDialog] = useState(false);
const [selectedMatchType, setSelectedMatchType] = useState(matchType);
 const colorSequence = ["Yellow", "Green", "Brown", "Blue", "Pink", "Black"];
  const [history, setHistory] = useState([]); // For undo
  const handleStartMatch = () => {
    setMatchStarted(true);
  };
  
 const [expectingColor, setExpectingColor] = useState(false);
  const [colorsPhase, setColorsPhase] = useState(false);
  const [colorSequenceIndex, setColorSequenceIndex] = useState(0);
  const addPoints = (points, ball) => {
  addToHistory();
  const updated = [...scores];
    updated[currentPlayer] += points;
    setScores(updated);
  setPotHistory((prev) => {
    const updated = [...prev];
    if (!updated[currentPlayer]) updated[currentPlayer] = [];
    updated[currentPlayer] = [...updated[currentPlayer], ball];
    return updated;
  });
    if (!colorsPhase) {
      if (ball === "Red") {
        setRedsRemaining((prev) => {
          const after = prev - 1;
          setExpectingColor(true);
          return after;
        });
        return;
      }

      if (redsRemaining === 0) {
        setColorsPhase(true);
        setColorSequenceIndex(0);
      } else {
        setExpectingColor(false);
      }
    } else {
     if (ball === colorSequence[colorSequenceIndex]) {
       if (colorSequenceIndex < colorSequence.length - 1) {
         setColorSequenceIndex((i) => i + 1);
       } else {
         handleFrameComplete();
       }
     }
   }
};
const handleFoulAndRed = () => {
  setRedsRemaining((prev) => {
    const after = prev - 1;

   
    if (after === 0) {
      setColorsPhase(true);
      setColorSequenceIndex(0);
    }

    return after;
  });

};
 const addToHistory = () => {
    setHistory((prev) => [
      ...prev,
      {
        scores,
        currentPlayer,
        redsRemaining,
        expectingColor,
        colorsPhase,
        colorSequenceIndex,
        potHistory,
      },
    ]);
  };
const handleNoPot = () => {
    addToHistory();
    addPoints(0, "Miss");
  
    nextTurn();
  };
   const handleFoul = (points) => {
    addToHistory();
    const updated = [...scores];
    const opponent = currentPlayer === 0 ? 1 : 0;
    updated[opponent] += points;
    setScores(updated);
     

    setExpectingColor(false);

    nextTurn();
    
  };
  const undo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;

      const last = prev[prev.length - 1];
      setScores(last.scores);
      setCurrentPlayer(last.currentPlayer);
      setRedsRemaining(last.redsRemaining);
      setExpectingColor(last.expectingColor);
      setColorsPhase(last.colorsPhase);
      setColorSequenceIndex(last.colorSequenceIndex);
      setPotHistory(last.potHistory);


      return prev.slice(0, prev.length - 1);
    });
  };
  const nextTurn = () => {
    addToHistory();
    setCurrentPlayer((prev) => (prev === 0 ? 1 : 0));
    setExpectingColor(false);
  };
 const resetGame = () => {
    setScores([0, 0]);
    setCurrentPlayer(0);
    setRedsRemaining(selectedMatchType);
    setExpectingColor(false);
    setColorsPhase(false);
    setColorSequenceIndex(0);
    setShowFrameDialog(false);
    setHistory([]);
setPotHistory([[], []]);
  };
  const handleMatchTypeChange = (numReds) => {
  setRedsRemaining(numReds);
    setSelectedMatchType(numReds);


};
 const handleFrameComplete = async () => {
  const winnerIndex = scores[0] > scores[1] ? 0 : 1;
  const winner = players[winnerIndex];

 const user = JSON.parse(localStorage.getItem("user"));
const token = user?.token; // ✅ assuming you saved it on login

  try {
  await fetch(`${import.meta.env.VITE_API_URL}/api/matches`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    player1: players[0],
    player2: players[1],
    winner,
    matchType,
    potHistory,
    scores,
    mode: "multiplayer",
    tournamentId: null,
    user: user._id, // ✅ include this
  }),
});
  } catch (err) {
    console.error("Failed to save multiplayer match:", err);
  }

  setShowFrameDialog(true); // or your winner display logic
};




  
  
const FrameCompletionDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-green-800 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-4">Frame Complete!</h2>
        <p className="mb-4">{scores[0] > scores[1] ? players[0] : players[1]} wins the frame!</p>
        <div className="flex justify-between gap-4">
          <button
            onClick={() => {
              resetGame();
              setShowFrameDialog(false);
            }}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
          >
            New Frame
          </button>
        </div>
      </div>
    </div>
  );
   
  return (
    <div className="min-h-screen bg-green-900 text-white">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <button
          onClick={() => {
            setMatchStarted(false);
            navigate("/match");
          }}
          className="bg-green-700 px-4 py-2 rounded hover:bg-green-600"
        >
          ← End Match
        </button>

        <Header />
        <Scoreboard playerNames={players} scores={scores} />
        <GameHistory history={potHistory} playerNames={players} />
         <BallControls
            onPot={addPoints}
            expectingColor={expectingColor}
            redsRemaining={redsRemaining}
             colorsPhase={colorsPhase}
            colorSequenceIndex={colorSequenceIndex}
           />

           <ActionControls
             onReset={resetGame}
             onNoPot={handleNoPot}
             onNextTurn={nextTurn}
             onUndo={undo}
           />

           <FrameStats
             currentPlayer={currentPlayer}
             playerNames={ players }
           />
       <FoulControls onFoul={handleFoul}
       handleFoulAndRed={handleFoulAndRed} />

         {showFrameDialog && <FrameCompletionDialog />}
      </div>
    </div>
  );
}
