import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    player1: { type: String, required: true },
    player2: { type: String, required: true },
    winner: { type: String },
    matchType: { type: Number, required: true },
    potHistory: { type: [[String]], default: [[], []] }, // 2D array for each player's pot history
    scores: { type: [Number], default: [0, 0] },
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", default: null },
    mode: { type: String, enum: ["tournament", "multiplayer"], default: "multiplayer" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Associate with user
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
