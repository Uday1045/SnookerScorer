import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function TournamentPage({ onBackToHome }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [tournamentId, setTournamentId] = useState(localStorage.getItem("tournamentId") || null);
  const [tournamentStage, setTournamentStage] = useState("setup");
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [selectedMatchType, setMatchType] = useState(null);
  const [semifinalMatches, setSemifinalMatches] = useState([]);
  const [finalMatch, setFinalMatch] = useState(null);

  // Load tournament from backend after a match
useEffect(() => {
  const winner = location.state?.winner;
  if (!winner || !tournamentId) return;

  const loadTournament = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tournaments/${tournamentId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Add auth header
        },
      });

      const data = await res.json();
      setPlayers(data.players);
      setSemifinalMatches(data.semifinalMatches);
      setFinalMatch(data.finalMatch);
      setTournamentStage(data.stage);
      setMatchType(data.matchType);
    } catch (err) {
      console.error("Error loading tournament:", err);
    }
  };

  loadTournament();
  navigate("/tournament", { replace: true, state: {} }); // clear navigation state
}, [location.state?.winner, tournamentId]);

  const handlePlayerNameChange = (index, value) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

 const handleStartTournament = async () => {
  const validPlayers = players.filter((p) => p.trim() !== "");
  if (validPlayers.length < 4) {
    alert("Please enter all 4 player names");
    return;
  }

  const semis = [
    { player1: validPlayers[0], player2: validPlayers[1], winner: null, completed: false },
    { player1: validPlayers[2], player2: validPlayers[3], winner: null, completed: false },
  ];

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const body = {
    players: validPlayers,
    matchType: selectedMatchType || 15,
    stage: "semifinals",
    semifinalMatches: semis,
    userId: user?._id,
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tournaments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setTournamentId(data._id);
    localStorage.setItem("tournamentId", data._id);
    setSemifinalMatches(data.semifinalMatches);
    setFinalMatch(data.finalMatch);
    setTournamentStage(data.stage);
  } catch (err) {
    console.error("Failed to start tournament:", err);
  }
};


  const onStartMatch = (player1, player2) => {
    navigate("/tournament-match", {
      state: {
        player1,
        player2,
        matchType: selectedMatchType || 15,
      },
    });
  };

  if (tournamentStage === "setup") {
    return (
      <div className="min-h-screen bg-green-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate("/")} className="bg-green-800 px-4 py-2 rounded text-white hover:bg-green-700">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white">Tournament Setup</h1>
          </div>

          <div className="bg-green-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl text-white mb-6">Enter Player Names</h2>
            <div className="space-y-4">
              {players.map((player, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={player}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    className="flex-1 px-4 py-2 rounded bg-green-700 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              ))}
              <h3 className="text-white text-lg font-semibold mb-2">Select Frame Type:</h3>
              <div className="flex gap-4">
                {[15, 10, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMatchType(num)}
                    className={`font-medium px-4 py-2 rounded border-2 transition duration-200 ${
                      selectedMatchType === num
                        ? "bg-yellow-500 text-black border-yellow-700"
                        : "bg-green-800 text-white hover:bg-green-700 border-green-600"
                    }`}
                  >
                    {num} Reds
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleStartTournament}
              className="w-full mt-8 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded transition-colors"
            >
              Start Tournament
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
         <button
  onClick={() => setTournamentStage("setup")}
  className="bg-green-800 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
>
  ← Back to Setup
</button>
          <h1 className="text-3xl font-bold text-white">Tournament Bracket</h1>
        </div>

        <div className="bg-green-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl text-white mb-4">Semi Finals</h2>
          <div className="space-y-4">
            {semifinalMatches.map((match, index) => (
              <div
                key={index}
                onClick={() => !match.completed && onStartMatch(match.player1, match.player2)}
                className={`bg-green-700 p-4 rounded-lg ${!match.completed ? "cursor-pointer hover:bg-green-600" : ""} transition`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-white font-bold ${match.completed && match.winner === match.player1 ? "text-yellow-400" : ""}`}>
                    {match.player1}
                  </span>
                  <span className="text-yellow-400 mx-2">VS</span>
                  <span className={`text-white font-bold ${match.completed && match.winner === match.player2 ? "text-yellow-400" : ""}`}>
                    {match.player2}
                  </span>
                </div>
                {match.completed ? (
                  <div className="text-sm text-center mt-2 text-green-300">Winner: {match.winner}</div>
                ) : (
                  <div className="text-xs text-center mt-2 text-green-400">Click to play match</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {finalMatch && (
          <div className="bg-green-800 p-6 rounded-lg">
            <h2 className="text-xl text-white mb-4">Final</h2>
            <div
              onClick={() => !finalMatch.completed && onStartMatch(finalMatch.player1, finalMatch.player2)}
              className={`bg-green-700 p-4 rounded-lg ${!finalMatch.completed ? "cursor-pointer hover:bg-green-600" : ""} transition`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-white font-bold ${finalMatch.completed && finalMatch.winner === finalMatch.player1 ? "text-yellow-400" : ""}`}>
                  {finalMatch.player1}
                </span>
                <span className="text-yellow-400 mx-2">VS</span>
                <span className={`text-white font-bold ${finalMatch.completed && finalMatch.winner === finalMatch.player2 ? "text-yellow-400" : ""}`}>
                  {finalMatch.player2}
                </span>
              </div>
              {finalMatch.completed ? (
                <div className="text-center mt-4">
                  <div className="text-2xl text-yellow-400 font-bold">🏆 Tournament Champion 🏆</div>
                  <div className="text-xl text-white mt-2">{finalMatch.winner}</div>
                </div>
              ) : (
                <div className="text-xs text-center mt-2 text-green-400">Click to play final match</div>
              )}
            </div>
          </div>
        )}

        {finalMatch?.completed && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setTournamentStage("setup");
                setPlayers(["", "", "", ""]);
                setSemifinalMatches([]);
                setFinalMatch(null);
                setMatchType(null);
                setTournamentId(null);
                localStorage.removeItem("tournamentId");
              }}
              className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-3 rounded transition-colors"
            >
              New Tournament
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
