import Tournament from "../models/TournamentModel.js";

// Create new tournament
export const createTournament = async (req, res) => {
  try {
    const { players, matchType, stage, semifinalMatches } = req.body;

    const tournament = new Tournament({
      userId: req.user.id, // ✅ associate with user
      players,
      matchType,
      stage,
      semifinalMatches,
      finalMatch: null,
    });

    await tournament.save();
    res.status(201).json(tournament);
  } catch (err) {
    console.error("Error creating tournament:", err);
    res.status(500).json({ error: "Failed to create tournament" });
  }
};

// Get one tournament by ID (only if belongs to user)
export const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findOne({
      _id: req.params.id,
      userId: req.user.id, // ✅ enforce ownership
    });

    if (!tournament) return res.status(404).json({ error: "Tournament not found" });
    res.json(tournament);
  } catch (err) {
    console.error("Error fetching tournament:", err);
    res.status(500).json({ error: "Failed to fetch tournament" });
  }
};

// Update tournament (only if belongs to user)
export const updateTournament = async (req, res) => {
  const { winner } = req.body;

  try {
    const tournament = await Tournament.findOne({
      _id: req.params.id,
      userId: req.user.id, // ✅ enforce ownership
    });

    if (!tournament) return res.status(404).json({ error: "Tournament not found" });

    // --- Update semifinals
    if (tournament.stage === "semifinals") {
      const updatedSemis = tournament.semifinalMatches.map((match) => {
        if (!match.completed && (match.player1 === winner || match.player2 === winner)) {
          return { ...match.toObject(), winner, completed: true };
        }
        return match;
      });

      tournament.semifinalMatches = updatedSemis;

      const completedSemis = updatedSemis.filter((m) => m.completed);
      if (completedSemis.length === 2) {
        tournament.finalMatch = {
          player1: completedSemis[0].winner,
          player2: completedSemis[1].winner,
          winner: null,
          completed: false,
        };
        tournament.stage = "final";
      }

      await tournament.save();
      return res.json(tournament);
    }

    // --- Update final
    if (tournament.stage === "final" && tournament.finalMatch) {
      if (
        (tournament.finalMatch.player1 === winner || tournament.finalMatch.player2 === winner) &&
        !tournament.finalMatch.completed
      ) {
        tournament.finalMatch.winner = winner;
        tournament.finalMatch.completed = true;
        tournament.stage = "completed";

        await tournament.save();
        return res.json(tournament);
      }
    }

    res.status(400).json({ error: "Invalid tournament stage or winner already set" });
  } catch (err) {
    console.error("Error updating tournament:", err);
    res.status(500).json({ error: "Failed to update tournament" });
  }
};

// ✅ Get all tournaments for logged-in user (for history)
export const getUserTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    console.error("Error fetching user tournaments:", err);
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
};
