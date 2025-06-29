import express from "express";
import {
  createTournament,
  getTournament,
  updateTournament,
  getUserTournaments,
} from "../controllers/tournamentController.js";
import { protect } from "../middleware/middle.js";

const router = express.Router();

router.post("/", protect, createTournament);
router.get("/:id", protect, getTournament);
router.put("/:id", protect, updateTournament);
router.get("/", protect, getUserTournaments); // ✅ for history

export default router;
