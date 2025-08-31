import Match from "../models/matchModel.js";

export const createMatch = async (req, res) => {
  try {
    const {
      player1,
      player2,
      winner,
      matchType,
      potHistory,
      scores,
      tournamentId,
      mode,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - no user" });
    }

    const match = new Match({
      player1,
      player2,
      winner,
      matchType,
      potHistory,
      scores,
      tournamentId: tournamentId || null,
      mode: mode || "multiplayer",
      userId: req.user._id, // ✅ Store the logged-in user
    });

    const savedMatch = await match.save();
    res.status(201).json(savedMatch);
  } catch (err) {
    console.error("Failed to create match:", err);
    res.status(500).json({ error: "Failed to create match" });
  }
};
export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({ userId: req.user._id });
    res.json(matches);
  } catch (err) {
    console.error("Failed to fetch matches:", err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
};
export const hellopage=async(req,res)=>{
  res.send("Hello Page");
};