import React, { useEffect, useState } from "react";

export default function MatchHistoryPage({ onBackToHome }) {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user?._id) {
          console.warn("Missing user or token");
          return;
        }

        const res = await fetch("http://localhost:5000/api/matches", {
         headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ include user token
      },
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

       const userMatches = data.filter(
  (match) => String(match.userId) === String(user._id)
);


        setMatches(userMatches.reverse());
      } catch (err) {
        console.error("Failed to fetch matches:", err.message);
      }
    };

    fetchAllMatches();
  }, []);

  const formatDateGroup = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupedTournaments = matches
    .filter((m) => m.mode === "tournament")
    .reduce((acc, match) => {
      const tid = match.tournamentId || "unknown";
      if (!acc[tid]) acc[tid] = [];
      acc[tid].push(match);
      return acc;
    }, {});

  const filteredMultiplayer = matches.filter(
    (m) =>
      m.mode === "multiplayer" &&
      (filter === "all" || filter === "multiplayer") &&
      (m.player1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.player2.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedMultiplayer = filteredMultiplayer.reduce((acc, match) => {
    const dateKey = formatDateGroup(match.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-green-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBackToHome}
            className="bg-green-800 px-4 py-2 rounded hover:bg-green-700"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Match History</h1>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by player name..."
          className="w-full px-4 py-2 mb-4 rounded bg-green-800 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />

        <div className="flex gap-4 mb-6">
          {["all", "multiplayer", "tournament"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded ${
                filter === type
                  ? "bg-yellow-500 text-black"
                  : "bg-green-800 hover:bg-green-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Multiplayer Matches */}
        {filter !== "tournament" &&
          Object.entries(groupedMultiplayer).map(([date, matches], dateIndex) => (
            <div key={dateIndex} className="mb-8">
              <h2 className="text-2xl text-yellow-400 mb-2">{date}</h2>
              <div className="space-y-4">
                {matches.map((match, index) => {
                  const isExpanded = expandedIndex === `${date}-${index}`;
                  return (
                    <div
                      key={index}
                      className="bg-green-800 p-4 rounded-lg shadow-lg transition duration-200"
                    >
                      <div
                        className="cursor-pointer flex justify-between items-center"
                        onClick={() =>
                          setExpandedIndex((prev) =>
                            prev === `${date}-${index}`
                              ? null
                              : `${date}-${index}`
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{match.player1}</span>
                          <span className="text-yellow-400">VS</span>
                          <span className="font-bold">{match.player2}</span>
                        </div>
                        <span className="text-green-300 text-sm">
                          Winner: <strong>{match.winner}</strong>
                        </span>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 text-sm text-green-200 space-y-2">
                          <div>Frame Type: {match.matchType} Reds</div>
                          <div>
                            Scores: {match.scores?.[0]} - {match.scores?.[1]}
                          </div>
                          <div className="mt-2">
                            <strong>Pot History:</strong>
                            <ul className="list-disc pl-5 mt-1">
                              {match.potHistory?.map((pots, i) => (
                                <li key={i}>
                                  {match[`player${i + 1}`] ||
                                    `Player ${i + 1}`}{" "}
                                  : {pots.join(", ") || "No pots"}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Tournament Matches */}
  {filter !== "multiplayer" &&
  Object.entries(groupedTournaments).map(([tid, games], i) => {
    const date = formatDateGroup(games[0]?.createdAt);
    const sorted = [...games].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return (
      <div
        key={i}
        className="mb-10 bg-green-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="bg-yellow-500 text-black text-lg font-bold px-6 py-3">
          🏆 Tournament - {date}
        </div>
        <div className="p-4 space-y-6">
          {sorted.map((match, index) => {
            const isExpanded = expandedIndex === `${tid}-${index}`;
            const stage =
              sorted.length === 3
                ? index === 0
                  ? "Semifinal 1"
                  : index === 1
                  ? "Semifinal 2"
                  : "Final"
                : `Match ${index + 1}`;

            return (
              <div
                key={index}
                className="bg-green-900 p-4 rounded-lg border border-green-700 transition duration-200"
              >
                <div
                  className="cursor-pointer flex justify-between items-center"
                  onClick={() =>
                    setExpandedIndex((prev) =>
                      prev === `${tid}-${index}` ? null : `${tid}-${index}`
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <span className=" text-yellow-400 px-2 py-1 rounded text-sm font-semibold">
                      {stage}
                    </span>
                    <span className="font-bold">{match.player1}</span>
                    <span className="text-yellow-400">VS</span>
                    <span className="font-bold">{match.player2}</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">
                    Winner: <strong className="text-white font-bold"   >{match.winner}</strong>
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-3 text-sm text-green-200 space-y-2">
                    <div>Frame Type: {match.matchType} Reds</div>
                    <div>
                      Scores: {match.scores?.[0]} - {match.scores?.[1]}
                    </div>
                    <div className="mt-2">
                      <strong>Pot History:</strong>
                      <ul className="list-disc pl-5 mt-1">
                        {match.potHistory?.map((pots, i) => (
                          <li key={i}>
                            {match[`player${i + 1}`] || `Player ${i + 1}`} :{" "}
                            {pots.join(", ") || "No pots"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  })}


        {matches.length === 0 && (
          <p className="text-yellow-300 text-center mt-10">
            No match history found.
          </p>
        )}
      </div>
    </div>
  );
}
