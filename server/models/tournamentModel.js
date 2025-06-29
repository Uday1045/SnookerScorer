import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  player1: { type: String, required: true },
  player2: { type: String, required: true },
  winner: { type: String, default: null },
  completed: { type: Boolean, default: false },
});

const tournamentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Link to user

    players: {
      type: [String],
      required: true,
      validate: [arr => arr.length === 4, "Exactly 4 players required"],
    },

    matchType: {
      type: Number,
      enum: [6, 10, 15],
      required: true,
    },

    stage: {
      type: String,
      enum: ["setup", "semifinals", "final", "completed"],
      default: "setup",
    },

    semifinalMatches: {
      type: [matchSchema],
      required: true,
    },

    finalMatch: {
      type: matchSchema,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tournament", tournamentSchema);
