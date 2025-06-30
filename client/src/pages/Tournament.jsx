import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Scoreboard from "../components/Scoreboard";
import BallControls from "../components/BallControls";
import ActionControls from "../components/ActionControls";
import GameHistory from "../components/GameHistory";
import FrameStats from "../components/FrameStats";
import FoulControls from "../components/FoulControls";

export default function TournamentMatchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { player1, player2, matchType = 15 } = location.state || {};
  const players = [player1 || "Player 1", player2 || "Player 2"];

  useEffect(() => {
    if (!player1 || !player2) {
      navigate("/tournament");
    }
  }, [player1, player2, navigate]);

  const [scores, setScores] = useState([0, 0]);
  const [potHistory, setPotHistory] = useState([[], []]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [redsRemaining, setRedsRemaining] = useState(matchType);
  const [expectingColor, setExpectingColor] = useState(false);
  const [colorsPhase, setColorsPhase] = useState(false);
  const [colorSequenceIndex, setColorSequenceIndex] = useState(0);
  const [history, setHistory] = useState([]);

  const colorSequence = ["Yellow", "Green", "Brown", "Blue", "Pink", "Black"];

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

  const addPoints = (points, ball) => {
    addToHistory();
    const updated = [...scores];
    updated[currentPlayer] += points;
    setScores(updated);
    setPotHistory((prev) => {
      const updated = [...prev];
      updated[currentPlayer] = [...(updated[currentPlayer] || []), ball];
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
          handleFrameComplete(); // Trigger end of match
        }
      }
    }
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

  const nextTurn = () => {
    addToHistory();
    setCurrentPlayer((prev) => (prev === 0 ? 1 : 0));
    setExpectingColor(false);
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

  const resetGame = () => {
    setScores([0, 0]);
    setCurrentPlayer(0);
    setRedsRemaining(matchType);
    setExpectingColor(false);
    setColorsPhase(false);
    setColorSequenceIndex(0);
    setPotHistory([[], []]);
    setHistory([]);
  };

  // const handleFrameComplete = async () => {
  //   const winnerIndex = scores[0] > scores[1] ? 0 : 1;
  //   const winner = players[winnerIndex];

  //   const tournamentId = localStorage.getItem("tournamentId");
  //   if (tournamentId) {
  //     try {
  //       await fetch(`/api/tournaments/${tournamentId}`, {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ winner }),
  //       });
  //     } catch (err) {
  //       console.error("Failed to update tournament winner:", err);
  //     }
  //   }

  //   navigate("/tournament", {
  //     state: { winner },
  //   });
  // };
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
const handleFrameComplete = async () => {
  const winnerIndex = scores[0] > scores[1] ? 0 : 1;
  const winner = players[winnerIndex];
  const token = localStorage.getItem("token");
  const tournamentId = localStorage.getItem("tournamentId");

  try {
    // 🔁 1. Save match under current user
    await fetch(`${import.meta.env.VITE_API_URL}/api/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Send auth token
      },
      body: JSON.stringify({
        player1: players[0],
        player2: players[1],
        winner,
        matchType,
        potHistory,
        scores,
        mode: "tournament",
        tournamentId,
      }),
    });

    // 🔁 2. Update tournament state
    await fetch(`${import.meta.env.VITE_API_URL}/api/tournaments/${tournamentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ again, send token
      },
      body: JSON.stringify({ winner }),
    });

    // 🔁 3. Redirect back to bracket
    navigate("/tournament", { state: { winner } });
  } catch (err) {
    console.error("Error updating tournament or saving match:", err);
  }
};


  return (
    <div className="min-h-screen bg-green-900 text-white">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <button
          onClick={() => navigate("/tournamentPage")}
          className="bg-green-700 px-4 py-2 rounded hover:bg-green-600"
        >
          ← Back to Tournament
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
        <FrameStats currentPlayer={currentPlayer} playerNames={players} />
        <FoulControls onFoul={handleFoul} handleFoulAndRed={handleFoulAndRed} />
      </div>
    </div>
  );
}
